import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    Dimensions,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import useRefresh from '../../hooks/useRefresh';
import AppText from '../../components/AppText';
import { useGetNotesQuery } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { capitalize } from '../../helpers/capitalize';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import { useAlert } from '../../context/AlertContext';
import { Theme } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const StudentHome = ({ navigation }) => {
    const { showAlert } = useAlert();
    const [userBasic, setUserBasic] = useState(null);
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);

    // Auto-slide Carousel Logic
    const scrollRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const promoCount = 2; // We currently have 2 promo banners

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % promoCount;
                scrollRef.current?.scrollTo({
                    x: next * (Theme.layout.windowWidth - (Theme.layout.screenPadding * 2)),
                    animated: true
                });
                return next;
            });
        }, 4000); // Auto-slide every 4 seconds

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        showAlert(
            "Logout",
            "Are you sure you want to logout?",
            "warning",
            {
                showCancel: true,
                confirmText: "Logout",
                onConfirm: async () => {
                    await AsyncStorage.clear();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                    });
                }
            }
        );
    };

    // Fetch basic user info (role, phone) from storage
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUserBasic(JSON.parse(userData));
            }
        };
        fetchUser();
    }, []);

    // Fetch detailed profile
    const { data: studentProfile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();


    // Dynamic names matching Store.jsx
    const categories = ['All', ...(studentProfile?.subjects?.map(s => capitalize(s)) || [])];

    // Backend automatically enforces Class and Board based on Student Profile
    const { data: notesData, isLoading: notesLoading, isFetching: notesFetching, refetch: refetchNotes } = useGetNotesQuery({
        subject: activeCategory === 'All' ? undefined : activeCategory,
        search: searchQuery || undefined,
        sortBy: sortBy,
        timeRange: timeRange,
    });

    // Compute Trending Notes - If sorted by rating, use directly, otherwise sort manually for home
    const displayNotes = React.useMemo(() => {
        return notesData?.notes || [];
    }, [notesData]);

    // Fetch Toppers
    const { data: toppersData, isLoading: toppersLoading, isFetching: toppersFetching, error: toppersError, refetch: refetchToppers } = useGetAllToppersQuery(undefined);


    const handleRefreshAction = useCallback(async () => {
        try {
            await refetchProfile?.();
            const promises = [];
            if (studentProfile) {
                promises.push(refetchToppers?.());
                promises.push(refetchNotes?.());
            }
            if (promises.length > 0) await Promise.all(promises);
        } catch (error) {
            console.error("Refresh Error:", error);
        }
    }, [refetchProfile, refetchToppers, refetchNotes, studentProfile]);

    const { refreshing, onRefresh } = useRefresh(handleRefreshAction);

    useFocusEffect(
        useCallback(() => {
            refetchProfile?.();
            if (studentProfile) {
                refetchToppers?.();
                refetchNotes?.();
            }
        }, [refetchProfile, refetchToppers, refetchNotes, studentProfile])
    );
    if (profileLoading) return <Loader visible />;

    const renderNoteCard = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.noteCard}
            onPress={() => navigation.navigate('StudentNoteDetails', { noteId: item._id })}
        >
            <Image
                source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/topper.avif')}
                style={styles.noteImage}
            />
            <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <AppText style={styles.ratingText}>{item.stats?.ratingAvg || '4.8'}</AppText>
            </View>
            <View style={styles.noteDetails}>
                <AppText style={styles.noteTitle} numberOfLines={1}>{item.title || `${item.subject} - ${item.chapterName}`}</AppText>
                <View style={styles.authorRow}>
                    <AppText style={styles.authorName} numberOfLines={1}>By {item.topperId?.fullName || 'Topper'}</AppText>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#00B1FC" />
                </View>
                <View style={styles.priceRow}>
                    <AppText style={styles.price}>₹{item.price}</AppText>
                    <View style={[styles.addButton, { backgroundColor: item.isPurchased ? '#10B981' : '#3B82F6' }]}>
                        <Ionicons name={item.isPurchased ? "lock-open" : "lock-closed"} size={16} color="white" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <Image
                        source={studentProfile?.profilePhoto ? { uri: studentProfile.profilePhoto } : require('../../../assets/student.avif')}
                        style={styles.avatar}
                    />
                    <View style={styles.welcomeTextContainer}>
                        <AppText style={styles.welcomeBack}>Class {studentProfile?.class} {studentProfile?.stream ? `• ${studentProfile.stream.split(' ')[0]}` : ''}</AppText>
                        <AppText style={styles.userName} weight="bold">Hi, {studentProfile?.fullName || 'Student'}</AppText>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <View style={styles.dot} />
                        <Feather name="bell" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.notificationBtn, { marginLeft: 10 }]} onPress={handleLogout}>
                        <Feather name="log-out" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                        colors={["#00B1FC"]}
                        backgroundColor="#0F172A"
                    />
                }
            >
                {/* Headline */}
                <AppText style={styles.headline}>Ready to top your{'\n'}
                    <AppText style={styles.headlineHighlight}>next exam?</AppText>
                </AppText>

                {/* Search Bar — filter icon opens Sort Modal */}
                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder={`Search ${studentProfile?.subjects?.[0] || 'Physics'}...`}
                    onFilterPress={() => setIsSortModalVisible(true)}
                    isFilterActive={sortBy !== 'newest' || timeRange !== 'all'}
                />

                {/* Categories */}
                <CategoryFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    style={{ marginBottom: 25 }}
                />

                {/* Promo Banner */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    style={styles.promoScroll}
                    onMomentumScrollEnd={(e) => {
                        const contentOffset = e.nativeEvent.contentOffset.x;
                        const viewSize = e.nativeEvent.layoutMeasurement.width;
                        const index = Math.floor(contentOffset / viewSize);
                        setCurrentSlide(index);
                    }}
                >
                    <TouchableOpacity activeOpacity={0.9}>
                        <LinearGradient
                            colors={['#2563EB', '#1D4ED8', '#1E40AF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.promoBanner}
                        >
                            <View style={styles.promoContent}>
                                <View style={styles.saleBadge}>
                                    <AppText style={styles.saleText} weight="bold">FLASH SALE</AppText>
                                </View>
                                <AppText style={styles.promoTitle} weight="bold">Exam Season{'\n'}Bundles</AppText>
                                <AppText style={styles.promoSubtitle}>Get 50% off on all subject packs</AppText>
                            </View>
                            <View style={styles.promoIllustration}>
                                <MaterialCommunityIcons name="bookshelf" size={80} color="rgba(255,255,255,0.3)" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Store')}>
                        <LinearGradient
                            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.promoBanner}
                        >
                            <View style={styles.promoContent}>
                                <View style={[styles.saleBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                                    <AppText style={styles.saleText} weight="bold">NEW RELEASES</AppText>
                                </View>
                                <AppText style={styles.promoTitle} weight="bold">Verified Topper{'\n'}Handwritten Notes</AppText>
                                <AppText style={styles.promoSubtitle}>Strictly as per latest board pattern</AppText>
                            </View>
                            <View style={styles.promoIllustration}>
                                <MaterialCommunityIcons name="certificate" size={80} color="rgba(255,255,255,0.3)" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>


                {/* Notes Section Title changes based on sort */}
                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                    <AppText style={styles.sectionTitle} weight="bold">
                        {sortBy === 'rating' ? 'Highest Rated Notes' :
                            sortBy === 'price_low' ? 'Best Deals' :
                                sortBy === 'price_high' ? 'Premium Notes' :
                                    timeRange === '24h' ? '🔥 Last 24 Hours' :
                                        timeRange === '7d' ? "This Week's Notes" :
                                            timeRange === '1m' ? "This Month's Notes" : 'Trending Notes'}
                    </AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                        <AppText style={styles.seeAll}>See all</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={displayNotes}
                    renderItem={renderNoteCard}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 15, paddingBottom: 10 }}
                    ListEmptyComponent={
                        (notesLoading || notesFetching) ? (
                            <View style={{ height: 200, width: width - 40, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#00B1FC" />
                            </View>
                        ) : (
                            <NoDataFound
                                message="No notes found."
                                containerStyle={{ width: width - 40, marginTop: 20 }}
                            />
                        )
                    }
                />

                {/* Meet Our Toppers */}
                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                    <AppText style={styles.sectionTitle} weight="bold">Meet Our Toppers</AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                        <AppText style={styles.seeAll}>View all</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    horizontal
                    data={toppersData?.data || []}
                    keyExtractor={(item) => item.id || item.userId}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toppersList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.topperCard}
                            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: item.topperId || item.userId })}
                        >
                            <Image
                                source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                                style={styles.topperAvatar}
                            />
                            <AppText style={styles.topperName} numberOfLines={1} weight="medium">
                                {item.name?.split(' ')[0]}
                            </AppText>
                            <View style={styles.topperRankBadge}>
                                <Ionicons name="trophy" size={8} color="#FFD700" />
                                <AppText style={styles.topperRankText}>Topper</AppText>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        (toppersLoading || toppersFetching) ? (
                            <View style={{ height: 120, width: width - 40, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#00B1FC" />
                            </View>
                        ) : (
                            <NoDataFound
                                message="No toppers found for your class."
                                containerStyle={{ width: width - 40, marginHorizontal: 0, paddingVertical: 20 }}
                            />
                        )
                    }
                />
                <View style={{ height: 100 }} />
            </ScrollView>

            <SortModal
                visible={isSortModalVisible}
                onClose={() => setIsSortModalVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingTop: 50,
    },
    scrollContent: {
        paddingHorizontal: Theme.layout.screenPadding,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    welcomeTextContainer: {
        marginLeft: 12,
    },
    welcomeBack: {
        fontSize: 12,
        color: '#94A3B8',
    },
    userName: {
        fontSize: 16,
        color: 'white',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationBtn: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#0F172A',
        zIndex: 1,
    },
    headline: {
        fontSize: 28,
        color: 'white',
        lineHeight: 36,
        marginBottom: 25,
    },
    headlineHighlight: {
        color: '#00B1FC',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    sortBtn: {
        width: 55,
        height: 55,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        position: 'relative',
    },
    activeSortDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        borderWidth: 1.5,
        borderColor: '#1E293B',
    },
    categoriesList: {
        marginBottom: 25,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#1E293B',
    },
    activeCategoryChip: {
        backgroundColor: '#00B1FC',
    },
    categoryText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    activeCategoryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    promoScroll: {
        marginBottom: 30,
    },
    promoBanner: {
        width: Theme.layout.windowWidth - (Theme.layout.screenPadding * 2),
        height: 180,
        backgroundColor: '#2563EB',
        borderRadius: 24,
        flexDirection: 'row',
        overflow: 'hidden',
        padding: Theme.layout.screenPadding,
    },
    promoContent: {
        flex: 1,
        justifyContent: 'center',
    },
    saleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    saleText: {
        color: 'white',
        fontSize: 10,
    },
    promoTitle: {
        fontSize: 22,
        color: 'white',
        marginBottom: 8,
    },
    promoSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    promoIllustration: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -Theme.layout.screenPadding,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        color: 'white',
    },
    seeAll: {
        color: '#00B1FC',
        fontSize: 14,
    },
    noteCard: {
        width: 180,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    noteImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    ratingText: {
        color: 'white',
        fontSize: 10,
        marginLeft: 4,
    },
    noteDetails: {
        padding: 12,
    },
    noteTitle: {
        color: 'white',
        fontSize: 14,
        marginBottom: 6,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    authorName: {
        color: '#94A3B8',
        fontSize: 12,
        marginRight: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        color: '#00B1FC',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toppersList: {
        paddingVertical: 10,
        gap: 15,
    },
    topperCard: {
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 20,
        width: 100,
        borderWidth: 1,
        borderColor: '#334155',
    },
    topperAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#00B1FC',
        marginBottom: 8,
    },
    topperName: {
        color: 'white',
        fontSize: 12,
        marginBottom: 4,
    },
    topperRankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    topperRankText: {
        color: '#FFD700',
        fontSize: 8,
        fontWeight: 'bold',
    },
});

export default StudentHome;
