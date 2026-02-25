import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import NoteStrip from '../../components/topper/NoteStrip';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useGetMyNotesQuery, useGetMySalesDetailsQuery } from '../../features/api/noteApi';
import { useAlert } from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const TopperHome = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const { data: notesData, isLoading, refetch: refetchNotes } = useGetMyNotesQuery({ sortBy: 'newest', page: 1, limit: 4 });
    const { data: salesData, isFetching: salesFetching, refetch: refetchSales } = useGetMySalesDetailsQuery({ page: 1, limit: 4 });
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refetchProfile?.();
            refetchNotes?.();
            refetchSales?.();
        }, [refetchProfile, refetchNotes, refetchSales])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchProfile?.(),
                refetchNotes?.(),
                refetchSales?.(),
            ]);
        } catch (err) {
            console.log('Refresh Error:', err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile, refetchNotes, refetchSales]);

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

    const stats = [
        {
            label: 'Total Sales',
            value: salesData?.summary?.totalSales || 0,
            icon: 'cart-outline',
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
        },
        {
            label: 'Revenue',
            value: `₹${salesData?.summary?.totalRevenue || 0}`,
            icon: 'wallet-outline',
            color: '#00B1FC',
            bg: 'rgba(0, 177, 252, 0.1)',
        },
        {
            label: 'Followers',
            value: profile?.data?.stats?.followersCount || 0,
            icon: 'people-outline',
            color: '#A855F7',
            bg: 'rgba(168, 85, 247, 0.1)',
        },
        {
            label: 'Rating',
            value: profile?.data?.stats?.rating?.average || '0.0',
            icon: 'star-outline',
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
        },
    ];

    const today = useMemo(() => {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return new Date().toLocaleDateString('en-US', options);
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <AppText style={styles.dateText}>{today}</AppText>
                    <AppText style={styles.greetingText} weight="bold">{greeting}, {profile?.data?.firstName || 'Topper'}</AppText>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('TopperProfile')}>
                        <Image
                            source={profile?.data?.profilePhoto ? { uri: profile.data.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.avatar}
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
                {/* Search / Announcement Banner */}
                <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#1E293B', '#111827']}
                        style={styles.banner}
                    >
                        <View style={styles.bannerContent}>
                            <View style={styles.badge}>
                                <AppText style={styles.badgeText}>COMMUNITY TIP</AppText>
                            </View>
                            <AppText style={styles.bannerTitle} weight="bold">Boost your sales by 30%</AppText>
                            <AppText style={styles.bannerDesc}>Add samples and detailed descriptions to your notes.</AppText>
                        </View>
                        <MaterialCommunityIcons name="rocket-launch-outline" size={40} color="#00B1FC" style={styles.bannerIcon} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Stats Section */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">Account Overview</AppText>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <AppText style={styles.liveText}>LIVE</AppText>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                                <Ionicons name={stat.icon} size={20} color={stat.color} />
                            </View>
                            <View>
                                <AppText style={styles.statValue} weight="bold">{stat.value}</AppText>
                                <AppText style={styles.statLabel}>{stat.label}</AppText>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Performance Tip Card */}
                <View style={[styles.performanceCard, { marginTop: 10 }]}>
                    <View style={styles.row}>
                        <View style={styles.perfIconBox}>
                            <Feather name="trending-up" size={20} color="#10B981" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <AppText style={styles.perfTitle} weight="bold">Top Performing Subjects</AppText>
                            <AppText style={styles.perfDesc}>Mathematics and Physics notes are currently trending in Class 12.</AppText>
                        </View>
                    </View>
                </View>

                {/* Upload Action */}
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('UploadNotes')}
                >
                    <LinearGradient
                        colors={['#00B1FC', '#007FFF']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.actionGradient}
                    >
                        <View>
                            <AppText style={styles.actionTitle} weight="bold">Upload New Content</AppText>
                            <AppText style={styles.actionSubtitle}>Start earning by sharing your expertise</AppText>
                        </View>
                        <View style={styles.addIconCircle}>
                            <Ionicons name="add" size={24} color="#00B1FC" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Recent Uploads */}
                <NoteStrip
                    title="Recent Content"
                    notes={notesData?.notes || []}
                    isLoading={isLoading}
                    onSeeAll={() => navigation.navigate('MyUploads')}
                    emptyMessage="You haven't uploaded anything yet."
                />

                {/* Top Sales */}
                <NoteStrip
                    title="Top Sellers"
                    notes={salesData?.notes || []}
                    isLoading={salesFetching}
                    onSeeAll={() => navigation.navigate('MySoldNotes')}
                    emptyMessage="No sales recorded yet."
                    accentColor="#10B981"
                />

                {/* Weekly Goal (Placeholder for gamification) */}
                <View style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <AppText style={styles.goalTitle} weight="bold">Weekly Sales Goal</AppText>
                        <AppText style={styles.goalPercent}>60%</AppText>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '60%' }]} />
                    </View>
                    <AppText style={styles.goalDesc}>Sell 4 more notes this week to unlock "Pro Seller" badge!</AppText>
                </View>

            </ScrollView>
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
        paddingBottom: 20,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    greetingText: {
        fontSize: 20,
        color: 'white',
        marginTop: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    bannerContainer: {
        marginHorizontal: 20,
        marginBottom: 25,
    },
    banner: {
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    bannerContent: {
        flex: 1,
    },
    badge: {
        backgroundColor: '#00B1FC20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    badgeText: {
        fontSize: 10,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    bannerTitle: {
        fontSize: 18,
        color: 'white',
        marginBottom: 4,
    },
    bannerDesc: {
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 18,
    },
    bannerIcon: {
        marginLeft: 10,
        opacity: 0.8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        color: 'white',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B98115',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    liveText: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statValue: {
        fontSize: 16,
        color: 'white',
    },
    statLabel: {
        fontSize: 11,
        color: '#64748B',
    },
    performanceCard: {
        marginHorizontal: 20,
        backgroundColor: '#1E293B60',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    perfIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#10B98115',
        justifyContent: 'center',
        alignItems: 'center',
    },
    perfTitle: {
        fontSize: 15,
        color: 'white',
    },
    perfDesc: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    actionCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    actionGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionTitle: {
        fontSize: 18,
        color: 'white',
    },
    actionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    addIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalCard: {
        marginHorizontal: 20,
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#00B1FC30',
        marginTop: 10,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 15,
        color: 'white',
    },
    goalPercent: {
        fontSize: 15,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#0F172A',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#00B1FC',
        borderRadius: 4,
    },
    goalDesc: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,
    }
});

export default TopperHome;
