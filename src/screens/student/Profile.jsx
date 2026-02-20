import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGetProfileQuery } from '../../features/api/studentApi';
import useRefresh from '../../hooks/useRefresh';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import { Theme } from '../../theme/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');

const Profile = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
    const { refreshing, onRefresh } = useRefresh(refetch);

    const handleLogout = () => {
        showAlert(
            "Logout",
            "Are you sure you want to sign out?",
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

    if (isLoading) return <Loader visible />;

    const stats = [
        {
            label: 'NOTES\nPURCHASED',
            value: profile?.stats?.notesPurchased || 0,
            icon: 'book-open-variant',
            color: '#3B82F6'
        },
        {
            label: 'HOURS\nSTUDIED',
            value: `${profile?.stats?.hoursStudied || 0}h`,
            icon: 'clock-outline',
            color: '#10B981'
        },
        {
            label: 'SUBJECTS\nCOVERED',
            value: profile?.stats?.subjectsCovered || 0,
            icon: 'layers-outline',
            color: '#F59E0B'
        }
    ];

    const menuItems = [
        { title: 'Payment Methods', icon: 'credit-card-outline', type: 'material' },
        { title: 'Transaction History', icon: 'file-document-outline', type: 'material' },
        { title: 'Account Settings', icon: 'account-cog-outline', type: 'material' }
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.settingsBtn} onPress={handleLogout}>
                        <Ionicons name="settings-outline" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.profileImageContainer}>
                        <Image
                            source={profile?.profilePhoto ? { uri: profile.profilePhoto } : require('../../../assets/student.avif')}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <AppText style={styles.userName} weight="bold">{profile?.fullName || 'Student Name'}</AppText>

                    <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                            <AppText style={styles.badgeText} weight="bold">Class {profile?.class || '12'}</AppText>
                        </View>
                        <AppText style={styles.subInfo}>  •  {profile?.board || 'Board'} Board • {profile?.stream?.split(' ')[0] || 'Science'}</AppText>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <MaterialCommunityIcons name={stat.icon} size={28} color="rgba(255,255,255,0.05)" style={styles.statIconBg} />
                            <AppText style={styles.statValue} weight="bold">{stat.value}</AppText>
                            <AppText style={styles.statLabel}>{stat.label}</AppText>
                        </View>
                    ))}
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={[styles.menuItem, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconContainer}>
                                    <MaterialCommunityIcons name={item.icon} size={20} color="white" />
                                </View>
                                <AppText style={styles.menuText} weight="medium">{item.title}</AppText>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">Recent Activity</AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('MyLibrary')}>
                        <AppText style={styles.viewAll}>VIEW ALL</AppText>
                    </TouchableOpacity>
                </View>

                {profile?.recentActivity?.length > 0 ? (
                    profile.recentActivity.map((activity, index) => (
                        <TouchableOpacity key={index} style={styles.activityCard}>
                            <View style={styles.activityLeft}>
                                <Image
                                    source={activity.thumbnail ? { uri: activity.thumbnail } : require('../../../assets/topper.avif')}
                                    style={styles.activityThumb}
                                />
                                <View style={styles.activityInfo}>
                                    <AppText style={styles.activityTitle} weight="bold">{activity.title}</AppText>
                                    <View style={styles.activityMeta}>
                                        <AppText style={styles.activityDate}>
                                            Purchased {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </AppText>
                                        <View style={styles.verifiedBadge}>
                                            <AppText style={styles.verifiedText}>Verified</AppText>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.downloadBtn}>
                                <Feather name="download" size={16} color="#3B82F6" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                ) : (
                    <NoDataFound
                        message="No recent activity found."
                        containerStyle={{ marginTop: 20 }}
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
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 30,
    },
    settingsBtn: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
        marginTop: -10,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: '#1E293B',
    },
    editBtn: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#3B82F6',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    userName: {
        fontSize: 24,
        color: 'white',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    classBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    badgeText: {
        color: '#60A5FA',
        fontSize: 12,
    },
    subInfo: {
        color: '#94A3B8',
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: '#1E293B',
        width: (width - (Theme.layout.screenPadding * 2 + 30)) / 3,
        height: 100,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    statIconBg: {
        position: 'absolute',
        top: 10,
        right: 5,
    },
    statValue: {
        fontSize: 22,
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 9,
        color: '#94A3B8',
        lineHeight: 12,
    },
    menuContainer: {
        backgroundColor: '#1E293B',
        marginHorizontal: Theme.layout.screenPadding,
        borderRadius: 20,
        paddingVertical: 5,
        marginBottom: 35,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        color: 'white',
        fontSize: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
    },
    viewAll: {
        color: '#3B82F6',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    activityCard: {
        backgroundColor: '#1E293B',
        marginHorizontal: Theme.layout.screenPadding,
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    activityThumb: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: '#334155',
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        color: 'white',
        fontSize: 14,
        marginBottom: 4,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityDate: {
        color: '#94A3B8',
        fontSize: 11,
        marginRight: 8,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 9,
        fontWeight: 'bold',
    },
    downloadBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Profile;
