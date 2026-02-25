import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import useRefresh from '../../hooks/useRefresh';
import AppText from '../../components/AppText';
import { useGetNotesQuery, useToggleFavoriteNoteMutation } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { capitalize } from '../../helpers/capitalize';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import ScreenLoader from '../../components/ScreenLoader';
import { useAlert } from '../../context/AlertContext';
import { Theme } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const StudentHome = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);
    const [toggleFavorite] = useToggleFavoriteNoteMutation();
    const [favoriteStates, setFavoriteStates] = useState({}); // {noteId: boolean}

    const handleFavoriteToggle = async (noteId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            setFavoriteStates(prev => ({ ...prev, [noteId]: newStatus }));
            await toggleFavorite(noteId).unwrap();
        } catch (error) {
            setFavoriteStates(prev => ({ ...prev, [noteId]: currentStatus }));
            showAlert("Error", "Failed to update favourite status", "error");
        }
    };

    // Auto-slide Carousel Logic
    const scrollRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const promoCount = 3;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % promoCount;
                scrollRef.current?.scrollTo({
                    x: next * (width - 40),
                    animated: true
                });
                return next;
            });
        }, 5000);

        return () => clearInterval(timer);
    }, []);


    // Fetch detailed profile
    const { data: studentProfile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();

    const categories = ['All', 'Class 12', 'Class 10', 'CBSE'];

    const subjects = useMemo(() => {
        return studentProfile?.subjects?.map(s => capitalize(s)) || [];
    }, [studentProfile]);

    const { data: notesData, isLoading: notesLoading, isFetching: notesFetching, refetch: refetchNotes } = useGetNotesQuery({
        class: activeCategory === 'Class 12' ? '12' : activeCategory === 'Class 10' ? '10' : undefined,
        board: activeCategory === 'CBSE' ? 'CBSE' : undefined,
        subject: selectedSubject || undefined,
        search: searchQuery || undefined,
        sortBy: sortBy,
        timeRange: timeRange,
    });

    const displayNotes = useMemo(() => {
        if (notesFetching && !refreshing) return [];
        return notesData?.notes || [];
    }, [notesData, notesFetching, refreshing]);

    const { data: toppersData, isLoading: toppersLoading, isFetching: toppersFetching, refetch: refetchToppers } = useGetAllToppersQuery(undefined);

    const displayToppers = useMemo(() => {
        if (toppersFetching && !refreshing) return [];
        return toppersData?.data || [];
    }, [toppersData, toppersFetching, refreshing]);

    const isInitialMount = useRef(true);

    // Redirect to Store on filter changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const hasChanges = searchQuery || activeCategory !== 'All' || selectedSubject || sortBy !== 'newest' || timeRange !== 'all';

        if (hasChanges) {
            navigation.navigate('Store', {
                search: searchQuery,
                category: activeCategory,
                subject: selectedSubject,
                sortBy: sortBy,
                timeRange: timeRange
            });
        }
    }, [searchQuery, activeCategory, selectedSubject, sortBy, timeRange]);

    const handleRefreshAction = useCallback(async () => {
        try {
            await Promise.all([
                refetchProfile?.().unwrap(),
                refetchToppers?.().unwrap(),
                refetchNotes?.().unwrap()
            ]);
        } catch (error) {
            console.error("Refresh Error:", error);
        }
    }, [refetchProfile, refetchToppers, refetchNotes]);

    const { refreshing, onRefresh } = useRefresh(handleRefreshAction);

    useFocusEffect(
        useCallback(() => {
            // Reset filters on Home so we can trigger redirect again on next interaction
            isInitialMount.current = true;
            setLocalSearch('');
            setActiveCategory('All');
            setSelectedSubject(null);
            setSortBy('newest');
            setTimeRange('all');

            refetchProfile?.();
            refetchToppers?.();
            refetchNotes?.();
        }, [])
    );

    const today = useMemo(() => {
        return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const renderNoteCard = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.noteCard}
            onPress={() => navigation.navigate('StudentNoteDetails', { noteId: item._id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/topper.avif')}
                    style={styles.noteImage}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
                    style={styles.imageGradient}
                />
                <TouchableOpacity
                    style={styles.saveBtnHome}
                    onPress={() => handleFavoriteToggle(item._id, favoriteStates[item._id] !== undefined ? favoriteStates[item._id] : item.isFavorite)}
                >
                    <Ionicons
                        name={(favoriteStates[item._id] !== undefined ? favoriteStates[item._id] : item.isFavorite) ? "heart" : "heart-outline"}
                        size={18}
                        color={(favoriteStates[item._id] !== undefined ? favoriteStates[item._id] : item.isFavorite) ? "#F43F5E" : "white"}
                    />
                </TouchableOpacity>

                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <AppText style={styles.ratingText}>{item.stats?.ratingAvg || '4.8'}</AppText>
                </View>
                {item.price === 0 && (
                    <View style={styles.freeBadge}>
                        <AppText style={styles.freeText} weight="bold">FREE</AppText>
                    </View>
                )}
            </View>

            <View style={styles.noteDetails}>
                <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>{item.subject} • {item.chapterName}</AppText>
                <View style={styles.authorRow}>
                    <Image
                        source={item.topperId?.profilePhoto ? { uri: item.topperId.profilePhoto } : require('../../../assets/topper.avif')}
                        style={styles.authorAvatar}
                    />
                    <AppText style={styles.authorName} numberOfLines={1}>{item.topperId?.fullName || 'Topper'}</AppText>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#00B1FC" />
                </View>
                <View style={styles.priceRow}>
                    <AppText style={styles.price} weight="bold">₹{typeof item.price === 'object' ? item.price.current : item.price}</AppText>
                    <View style={[styles.addButton, { backgroundColor: item.isPurchased ? '#10B98120' : '#00B1FC20' }]}>
                        <Ionicons
                            name={item.isPurchased ? "checkmark-circle" : "arrow-forward"}
                            size={16}
                            color={item.isPurchased ? '#10B981' : '#00B1FC'}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderTopperCircle = ({ item }) => (
        <TouchableOpacity
            style={styles.topperCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: item.userId })}
        >
            <View style={styles.topperAvatarWrapper}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.topperAvatar}
                />
                <View style={styles.topperStatusDot} />
            </View>
            <AppText style={styles.topperName} numberOfLines={1} weight="medium">
                {item.name?.split(' ')[0]}
            </AppText>
            <View style={styles.topperExpertiseBadge}>
                <AppText style={styles.topperExpertiseText}>{item.stream || item.board || 'Expert'}</AppText>
            </View>
        </TouchableOpacity>
    );

    // if (profileLoading) return <ScreenLoader />;

    return (
        <View style={styles.container}>
            {/* <Loader visible={notesFetching && !refreshing} /> */}
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText style={styles.dateText}>{today}</AppText>
                    <AppText style={styles.greetingText} weight="bold">{greeting}, {studentProfile?.fullName?.split(' ')[0] || 'Student'}</AppText>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <View style={styles.notifDot} />
                        <Feather name="bell" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Image
                            source={studentProfile?.profilePhoto ? { uri: studentProfile.profilePhoto } : require('../../../assets/student.avif')}
                            style={styles.headerAvatar}
                        />
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
                {/* Search Bar Area */}
                <View style={styles.searchSection}>
                    <SearchBar
                        value={localSearch}
                        onChangeText={setLocalSearch}
                        placeholder={`Find notes for ${studentProfile?.subjects?.[0] || 'your subjects'}...`}
                        onFilterPress={() => setIsSortModalVisible(true)}
                        isFilterActive={sortBy !== 'newest' || timeRange !== 'all'}
                    />
                </View>

                {/* Categories */}
                <CategoryFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    style={styles.categoryBar}
                />

                {/* Promo Banners Carousel */}
                <View style={styles.promoContainer}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        onMomentumScrollEnd={(e) => {
                            const contentOffset = e.nativeEvent.contentOffset.x;
                            const viewSize = e.nativeEvent.layoutMeasurement.width;
                            const index = Math.round(contentOffset / viewSize);
                            setCurrentSlide(index);
                        }}
                    >
                        {/* Slide 1 */}
                        <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9}>
                            <LinearGradient
                                colors={['#3B82F6', '#1D4ED8']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.promoGradient}
                            >
                                <View style={styles.promoTextGroup}>
                                    <View style={styles.promoBadge}>
                                        <AppText style={styles.promoBadgeText} weight="bold">LIMITED TIME</AppText>
                                    </View>
                                    <AppText style={styles.promoTitle} weight="bold">Exam Season{'\n'}Flash Sale</AppText>
                                    <AppText style={styles.promoSubtitle}>Unlock all bundles at 40% OFF</AppText>
                                </View>
                                <MaterialCommunityIcons name="lightning-bolt" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Slide 2 */}
                        <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9} onPress={() => navigation.navigate('Store')}>
                            <LinearGradient
                                colors={['#8B5CF6', '#6D28D9']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.promoGradient}
                            >
                                <View style={styles.promoTextGroup}>
                                    <View style={[styles.promoBadge, { backgroundColor: '#FBBF24' }]}>
                                        <AppText style={[styles.promoBadgeText, { color: '#000' }]} weight="bold">VERIFIED</AppText>
                                    </View>
                                    <AppText style={styles.promoTitle} weight="bold">AIR 1 Hand-written{'\n'}Solved Notes</AppText>
                                    <AppText style={styles.promoSubtitle}>Strictly based on 2024 Boards</AppText>
                                </View>
                                <MaterialCommunityIcons name="book-open-page-variant" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Slide 3 */}
                        <TouchableOpacity style={styles.promoSlide} activeOpacity={0.9}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.promoGradient}
                            >
                                <View style={styles.promoTextGroup}>
                                    <View style={[styles.promoBadge, { backgroundColor: '#fff' }]}>
                                        <AppText style={[styles.promoBadgeText, { color: '#10B981' }]} weight="bold">FREEBIE</AppText>
                                    </View>
                                    <AppText style={styles.promoTitle} weight="bold">Free Sample{'\n'}Cheat Sheets</AppText>
                                    <AppText style={styles.promoSubtitle}>Quick revision formulas for all</AppText>
                                </View>
                                <MaterialCommunityIcons name="fire" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Dots indicator */}
                    <View style={styles.dotsRow}>
                        {[0, 1, 2].map(i => (
                            <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
                        ))}
                    </View>
                </View>

                {/* Recommended Notes Section */}
                <View style={styles.sectionHeader}>
                    <View>
                        <AppText style={styles.sectionTitle} weight="bold">Trending Notes For You</AppText>
                        <AppText style={styles.sectionSub}>Based on your class & board</AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                        <AppText style={styles.seeAllText}>See All</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={displayNotes}
                    renderItem={renderNoteCard}
                    keyExtractor={(item) => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.notesList}
                    ListEmptyComponent={
                        (notesLoading || notesFetching) ? (
                            <ActivityIndicator size="large" color="#00B1FC" style={{ width: width - 40, marginTop: 20 }} />
                        ) : (
                            <NoDataFound
                                message="No notes matching your filters."
                                icon="document-text-outline"
                                style={{ width: "100%" }}
                            />
                        )
                    }
                />

                {/* Popular Toppers */}
                <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                    <View>
                        <AppText style={styles.sectionTitle} weight="bold">Meet Our Toppers</AppText>
                        <AppText style={styles.sectionSub}>Learn from the best in the country</AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AllToppers')}>
                        <AppText style={styles.seeAllText}>View All</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={displayToppers}
                    renderItem={renderTopperCircle}
                    keyExtractor={(item) => item.userId}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toppersList}
                    ListEmptyComponent={
                        (toppersLoading || toppersFetching) ? (
                            <ActivityIndicator size="small" color="#00B1FC" style={{ width: width - 40 }} />
                        ) : null
                    }
                />

                {/* Pro Tip Card */}
                <View style={styles.proTipCard}>
                    <View style={styles.tipIconBox}>
                        <Ionicons name="bulb" size={24} color="#FBBF24" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <AppText style={styles.tipTitle} weight="bold">Pro Tip for Exams</AppText>
                        <AppText style={styles.tipDesc}>Handwritten notes improve recall speed by 25% compared to typed ones.</AppText>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <SortModal
                visible={isSortModalVisible}
                onClose={() => setIsSortModalVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                subjects={subjects}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    greetingText: {
        fontSize: 22,
        color: 'white',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    notifDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#1E293B',
        zIndex: 1,
    },
    profileBtn: {
        borderWidth: 2,
        borderColor: '#10B981',
        borderRadius: 22,
        padding: 2,
    },
    headerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    scrollContent: {
        paddingTop: 10,
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    categoryBar: {
        marginBottom: 25,
        paddingLeft: 20,
    },
    promoContainer: {
        marginBottom: 35,
    },
    promoSlide: {
        width: width - 40,
        marginHorizontal: 20,
        borderRadius: 28,
        overflow: 'hidden',
    },
    promoGradient: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        height: 180,
    },
    promoTextGroup: {
        flex: 1,
    },
    promoBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    promoBadgeText: {
        fontSize: 10,
        color: 'white',
    },
    promoTitle: {
        fontSize: 24,
        color: 'white',
        lineHeight: 32,
        marginBottom: 8,
    },
    promoSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    promoIcon: {
        marginLeft: 10,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 15,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#334155',
    },
    activeDot: {
        width: 20,
        backgroundColor: '#00B1FC',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 18,
        color: 'white',
    },
    sectionSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    seeAllText: {
        fontSize: 14,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    notesList: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
    },
    noteCard: {
        width: 220,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 140,
        position: 'relative',
    },
    noteImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },
    saveBtnHome: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ratingText: {
        color: 'white',
        fontSize: 11,
    },
    freeBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    freeText: {
        color: 'white',
        fontSize: 10,
    },
    noteDetails: {
        padding: 16,
    },
    noteTitle: {
        fontSize: 15,
        color: 'white',
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    authorName: {
        fontSize: 12,
        color: '#94A3B8',
        flexShrink: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        color: 'white',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toppersList: {
        paddingLeft: 20,
        paddingRight: 10,
        paddingBottom: 10,
    },
    topperCard: {
        width: 90,
        alignItems: 'center',
        marginRight: 20,
    },
    topperAvatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    topperAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: '#334155',
    },
    topperStatusDot: {
        position: 'absolute',
        bottom: 2,
        right: 6,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: '#0F172A',
    },
    topperName: {
        fontSize: 13,
        color: 'white',
        marginBottom: 4,
    },
    topperExpertiseBadge: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    topperExpertiseText: {
        fontSize: 9,
        color: '#64748B',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    proTipCard: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FBBF2430',
    },
    tipIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FBBF2415',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipTitle: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    tipDesc: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 18,
    }
});

export default StudentHome;
