import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useGetMyNotesQuery } from '../../features/api/noteApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const TopperHome = ({ navigation }) => {
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const { data: notesData, isLoading, refetch: refetchNotes } = useGetMyNotesQuery();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refetchProfile?.();
            refetchNotes?.();
        }, [refetchProfile, refetchNotes])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchProfile?.().unwrap(),
                refetchNotes?.().unwrap()
            ]);
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile, refetchNotes]);

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

    const topperStats = profile?.data?.stats;

    const stats = [
        {
            label: 'Total Earnings',
            value: `₹${topperStats?.totalEarnings || 0}`,
            icon: 'cash-outline',
            color: '#10B981'
        },
        {
            label: 'Notes Sold',
            value: `${topperStats?.totalSold || 0}`,
            icon: 'book-outline',
            color: '#00B1FC'
        },
        {
            label: 'Avg Rating',
            value: `${topperStats?.rating?.average || '0.0'}`,
            icon: 'star-outline',
            color: '#F59E0B'
        },
        {
            label: 'Total Uploads',
            value: `${topperStats?.totalNotes || 0}`,
            icon: 'document-text-outline',
            color: '#A855F7'
        },
    ];

    const renderNoteCard = ({ item }) => (
        <View style={styles.noteCard}>
            <View style={[styles.noteStatusBadge, {
                backgroundColor: item.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.2)' :
                    item.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' :
                        'rgba(245, 158, 11, 0.2)'
            }]}>
                <AppText style={[styles.statusText, {
                    color: item.status === 'PUBLISHED' ? '#10B981' :
                        item.status === 'REJECTED' ? '#EF4444' :
                            '#F59E0B'
                }]}>
                    {item.status === 'PUBLISHED' ? 'Approved' :
                        item.status === 'REJECTED' ? 'Rejected' :
                            'Pending'}
                </AppText>
            </View>
            <View style={styles.noteDetails}>
                <AppText style={styles.noteTitle} numberOfLines={1}>{item.subject} - {item.chapterName}</AppText>
                <AppText style={styles.noteSub}>{item.class} • {item.board}</AppText>
                <View style={styles.priceRow}>
                    <AppText style={styles.price}>₹{item.price}</AppText>
                    <AppText style={styles.sales}>{item.salesCount || 0} Sales</AppText>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <Image
                        source={profile?.data?.profilePhoto ? { uri: profile.data.profilePhoto } : require('../../../assets/topper.avif')}
                        style={styles.avatar}
                    />
                    <View style={styles.welcomeTextContainer}>
                        <AppText style={styles.welcomeBack}>Topper Dashboard</AppText>
                        <AppText style={styles.userName} weight="bold">{profile?.data?.fullName || 'Topper'}</AppText>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.notificationBtn}>
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
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: `${stat.color}20` }]}>
                                <Ionicons name={stat.icon} size={20} color={stat.color} />
                            </View>
                            <AppText style={styles.statValue} weight="bold">{stat.value}</AppText>
                            <AppText style={styles.statLabel}>{stat.label}</AppText>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <AppText style={styles.sectionTitle} weight="bold">Quick Actions</AppText>
                <TouchableOpacity
                    style={styles.uploadCard}
                    onPress={() => navigation.navigate('UploadNotes')}
                >
                    <LinearGradient
                        colors={['#00B1FC', '#007BB5']}
                        style={styles.uploadGradient}
                    >
                        <View style={styles.uploadInfo}>
                            <AppText style={styles.uploadTitle} weight="bold">Upload New Notes</AppText>
                            <AppText style={styles.uploadSubtitle}>Share your knowledge & earn</AppText>
                        </View>
                        <View style={styles.uploadIconCircle}>
                            <Ionicons name="add" size={30} color="#00B1FC" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* My Uploads */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">My Recent Uploads</AppText>
                    <TouchableOpacity>
                        <AppText style={styles.seeAll}>See all</AppText>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator color="#00B1FC" />
                ) : (
                    <FlatList
                        data={notesData?.slice(0, 5) || []}
                        renderItem={renderNoteCard}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="file-document-outline" size={50} color="#334155" />
                                <AppText style={styles.emptyText}>No notes uploaded yet</AppText>
                            </View>
                        }
                    />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 25,
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
        borderColor: '#00B1FC',
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 15,
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#94A3B8',
    },
    sectionTitle: {
        fontSize: 18,
        color: 'white',
        marginBottom: 15,
    },
    uploadCard: {
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    uploadGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    uploadInfo: {
        flex: 1,
    },
    uploadTitle: {
        fontSize: 18,
        color: 'white',
    },
    uploadSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    uploadIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAll: {
        color: '#00B1FC',
        fontSize: 14,
    },
    noteCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    noteStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        marginRight: 15,
    },
    statusText: {
        color: '#F59E0B',
        fontSize: 10,
        fontWeight: 'bold',
    },
    noteDetails: {
        flex: 1,
    },
    noteTitle: {
        color: 'white',
        fontSize: 14,
        marginBottom: 4,
    },
    noteSub: {
        color: '#94A3B8',
        fontSize: 12,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        color: '#00B1FC',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sales: {
        color: '#64748B',
        fontSize: 11,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#64748B',
        marginTop: 10,
    }
});

export default TopperHome;
