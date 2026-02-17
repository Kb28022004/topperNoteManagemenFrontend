import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
    Dimensions,
    RefreshControl
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import { useGetNotesQuery } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const StudentHome = ({ navigation }) => {
    const [userBasic, setUserBasic] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    }
                }
            ]
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

    // Dynamic categories based on student's registered subjects
    const categories = ['All', ...(studentProfile?.subjects || [])];

    // Fetch notes based on active category (Subject) and Search
    // Backend automatically enforces Class and Board based on Student Profile
    const { data: notesData, isLoading: notesLoading, refetch: refetchNotes } = useGetNotesQuery({
        subject: activeCategory === 'All' ? undefined : activeCategory,
        search: searchQuery || undefined,
    }, {
        skip: !studentProfile // Wait for profile to load
    });

    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refetchProfile?.();
            if (studentProfile) {
                refetchNotes?.();
            }
        }, [refetchProfile, refetchNotes, studentProfile])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchProfile?.().unwrap();
            if (studentProfile) {
                await refetchNotes?.().unwrap();
            }
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile, refetchNotes, studentProfile]);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                activeCategory === item && styles.activeCategoryChip
            ]}
            onPress={() => setActiveCategory(item)}
        >
            <AppText style={[
                styles.categoryText,
                activeCategory === item && styles.activeCategoryText
            ]}>
                {item}
            </AppText>
        </TouchableOpacity>
    );

    const renderNoteCard = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.noteCard}
            onPress={() => navigation.navigate('NotePreview', { noteId: item._id })}
        >
            <Image
                source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/topper.avif')}
                style={styles.noteImage}
            />
            <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <AppText style={styles.ratingText}>{item.rating || '4.8'}</AppText>
            </View>
            <View style={styles.noteDetails}>
                <AppText style={styles.noteTitle} numberOfLines={1}>{item.title || `${item.subject} - ${item.chapterName}`}</AppText>
                <View style={styles.authorRow}>
                    <AppText style={styles.authorName} numberOfLines={1}>By {item.topperId?.fullName || 'Topper'}</AppText>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#00B1FC" />
                </View>
                <View style={styles.priceRow}>
                    <AppText style={styles.price}>₹{item.price}</AppText>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
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
                        <AppText style={styles.userName} weight="bold">Hi, {studentProfile?.firstName || 'Student'}</AppText>
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

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Feather name="search" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${studentProfile?.subjects?.[0] || 'Physics'}...`}
                            placeholderTextColor="#64748B"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={24} color="#00B1FC" />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesList}
                    contentContainerStyle={{ gap: 10 }}
                />

                {/* Promo Banner */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled style={styles.promoScroll}>
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
                </ScrollView>

                {/* Trending Notes */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">Trending Notes</AppText>
                    <TouchableOpacity>
                        <AppText style={styles.seeAll}>See all</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={notesData?.notes || [1, 2, 3]} // Mock data if empty
                    renderItem={renderNoteCard}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 15, paddingBottom: 100 }}
                />
            </ScrollView>

            {/* Bottom Navigation (Mock for now, should be in Navigator) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#00B1FC" />
                    <AppText style={[styles.navText, { color: '#00B1FC' }]}>Home</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="library-outline" size={24} color="#94A3B8" />
                    <AppText style={styles.navText}>My Library</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartButton}>
                    <Ionicons name="cart" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="storefront-outline" size={24} color="#94A3B8" />
                    <AppText style={styles.navText}>Store</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#94A3B8" />
                    <AppText style={styles.navText}>Profile</AppText>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
        fontSize: 15,
    },
    filterBtn: {
        width: 55,
        height: 55,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
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
        width: width - 40,
        height: 180,
        backgroundColor: '#2563EB',
        borderRadius: 24,
        flexDirection: 'row',
        overflow: 'hidden',
        padding: 20,
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
        marginRight: -20,
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
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        backgroundColor: '#0F172A',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 4,
    },
    cartButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00B1FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -30,
        elevation: 5,
        shadowColor: '#00B1FC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
});

export default StudentHome;
