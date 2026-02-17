import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { useGetProfileQuery } from '../../features/api/topperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const TopperProfile = ({ navigation }) => {
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchProfile().unwrap();
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile]);
    const userData = profile?.data;

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

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', color: '#00B1FC' },
        { icon: 'document-text-outline', label: 'My Uploads', color: '#A855F7' },
        { icon: 'wallet-outline', label: 'Earnings & Payments', color: '#10B981' },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: '#F59E0B' },
        { icon: 'help-circle-outline', label: 'Support & Help', color: '#64748B' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AppText style={styles.headerTitle} weight="bold">Profile</AppText>
                <TouchableOpacity onPress={handleLogout}>
                    <Feather name="log-out" size={22} color="#EF4444" />
                </TouchableOpacity>
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
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={userData?.profilePhoto ? { uri: userData.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge}>
                            <Feather name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                    <AppText style={styles.userName} weight="bold">{userData?.fullName || 'Topper Name'}</AppText>
                    <AppText style={styles.userRole}>Class {userData?.expertiseClass} {userData?.stream} Topper</AppText>

                    <View style={styles.socialRow}>
                        <View style={styles.statBox}>
                            <AppText style={styles.statValue} weight="bold">{userData?.stats?.followersCount || 0}</AppText>
                            <AppText style={styles.statLabel}>Followers</AppText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statBox}>
                            <AppText style={styles.statValue} weight="bold">{userData?.stats?.rating?.average || '0.0'}</AppText>
                            <AppText style={styles.statLabel}>Rating</AppText>
                        </View>
                    </View>
                </View>

                {/* Settings Menu */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                                <Ionicons name={item.icon} size={20} color={item.color} />
                            </View>
                            <AppText style={styles.menuLabel}>{item.label}</AppText>
                            <Feather name="chevron-right" size={20} color="#334155" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Account Removal */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 10 }} />
                    <AppText style={styles.logoutText}>Sign Out</AppText>
                </TouchableOpacity>

                <AppText style={styles.version}>Version 1.0.2 • Made with ❤️ for Students</AppText>
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
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#1E293B',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00B1FC',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0F172A',
    },
    userName: {
        fontSize: 22,
        color: 'white',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 20,
    },
    socialRow: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#334155',
        marginHorizontal: 30,
    },
    menuContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: 'white',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: 30,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
    }
});

export default TopperProfile;
