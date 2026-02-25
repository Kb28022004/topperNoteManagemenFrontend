import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    RefreshControl,
    StatusBar,
    Switch,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import { useGetProfileQuery, useUpdateProfilePictureMutation } from '../../features/api/topperApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '../../context/AlertContext';
import * as ImagePicker from 'expo-image-picker';
import Loader from '../../components/Loader';

const TopperProfile = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const [updateProfilePicture, { isLoading: isUpdating }] = useUpdateProfilePictureMutation();
    const [refreshing, setRefreshing] = React.useState(false);
    const [isOnline, setIsOnline] = React.useState(true);

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

    const handleUpdatePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAlert("Permission Denied", "We need camera roll permissions to change your profile picture.", "error");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const formData = new FormData();

                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('photo', {
                    uri: imageUri,
                    name: filename,
                    type,
                });

                await updateProfilePicture(formData).unwrap();
                showAlert("Success", "Profile picture updated successfully", "success");
            }
        } catch (err) {
            console.error("Profile Photo Update Error:", err);
            showAlert("Error", "Failed to update profile picture. Please try again.", "error");
        }
    };

    const menuSections = [
        {
            title: 'Store Management',
            items: [
                { icon: 'document-text-outline', label: 'Manage Uploads', color: '#A855F7', onPress: () => navigation.navigate('MyUploads') },
                { icon: 'trending-up-outline', label: 'Sales Analytics', color: '#10B981', onPress: () => navigation.navigate('MySoldNotes') },
                { icon: 'star-outline', label: 'Reviews & Ratings', color: '#F59E0B', onPress: () => navigation.navigate('TopperReviews', { topperId: userData?.userId }) },
            ]
        },
        {
            title: 'Professional Profile',
            items: [
                { icon: 'person-outline', label: 'Personal Information', color: '#6366F1', onPress: () => navigation.navigate('EditAcademicProfile') },
                { icon: 'wallet-outline', label: 'Earnings & Payouts', color: '#10B981', onPress: () => navigation.navigate('EarningsPayouts') },
                { icon: 'shield-checkmark-outline', label: 'Identity Verification', color: '#00B1FC', onPress: null },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: 'notifications-outline', label: 'Push Notifications', color: '#64748B', onPress: null, type: 'toggle' },
                { icon: 'globe-outline', label: 'Language Settings', color: '#64748B', onPress: null },
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Settings</AppText>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                    <Feather name="log-out" size={20} color="#EF4444" />
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
                        backgroundColor="#0F172A"
                    />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={userData?.profilePhoto ? { uri: userData.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.cameraBtn} onPress={handleUpdatePhoto}>
                            <Feather name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoArea}>
                        <View style={styles.nameRow}>
                            <AppText style={styles.userName} weight="bold">{userData?.fullName || 'Topper Name'}</AppText>
                            {userData?.verified && <MaterialCommunityIcons name="check-decagram" size={20} color="#00B1FC" style={{ marginLeft: 6 }} />}
                        </View>
                        <AppText style={styles.userRole}>Class {userData?.expertiseClass} {userData?.stream} Topper</AppText>

                        <TouchableOpacity
                            style={styles.previewBtn}
                            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: userData?.userId })}
                        >
                            <Feather name="eye" size={14} color="#00B1FC" />
                            <AppText style={styles.previewText} weight="bold">Preview Public Profile</AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats Banner */}
                <View style={styles.statsBanner}>
                    <TouchableOpacity
                        style={styles.bannerStat}
                        onPress={() => navigation.navigate('Followers', { userId: userData?.userId, name: userData?.fullName })}
                    >
                        <AppText style={styles.statVal} weight="bold">{userData?.stats?.followersCount || 0}</AppText>
                        <AppText style={styles.statLab}>Followers</AppText>
                    </TouchableOpacity>
                    <View style={styles.bannerDivider} />
                    <View style={styles.bannerStat}>
                        <AppText style={styles.statVal} weight="bold">₹{userData?.stats?.totalEarnings || 0}</AppText>
                        <AppText style={styles.statLab}>Revenue</AppText>
                    </View>
                    <View style={styles.bannerDivider} />
                    <View style={styles.bannerStat}>
                        <AppText style={styles.statVal} weight="bold">{userData?.stats?.rating?.average || '0.0'}</AppText>
                        <AppText style={styles.statLab}>Rating</AppText>
                    </View>
                </View>

                {/* Profile Visibility Toggle */}
                <View style={styles.visibilityCard}>
                    <View style={styles.visibilityText}>
                        <AppText style={styles.visTitle} weight="bold">Profile Visibility</AppText>
                        <AppText style={styles.visSub}>Allow students to find your notes</AppText>
                    </View>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: '#334155', true: '#00B1FC' }}
                        thumbColor="white"
                    />
                </View>

                {/* Settings Menu Sections */}
                {menuSections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.menuSection}>
                        <AppText style={styles.sectionLabel} weight="bold">{section.title}</AppText>
                        <View style={styles.menuGroup}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.menuItem, index === section.items.length - 1 && { borderBottomWidth: 0 }]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <AppText style={styles.menuLabel}>{item.label}</AppText>
                                    {item.type === 'toggle' ? (
                                        <Switch value={true} size="small" trackColor={{ false: '#334155', true: '#00B1FC' }} />
                                    ) : (
                                        <Feather name="chevron-right" size={18} color="#475569" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <AppText style={styles.logoutText} weight="bold">Sign Out from Device</AppText>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <AppText style={styles.version}>TopperNotes Partner • v1.0.4</AppText>
                    <AppText style={styles.supportLink}>Read Terms & Privacy Policy</AppText>
                </View>
            </ScrollView>

            {isUpdating && <Loader message="Updating profile photo..." />}
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    logoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EF444415',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 50,
    },
    profileSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#1E293B',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00B1FC',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    infoArea: {
        marginLeft: 20,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    userName: {
        fontSize: 20,
        color: 'white',
    },
    userRole: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 10,
    },
    previewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00B1FC10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#00B1FC30',
        gap: 6,
    },
    previewText: {
        fontSize: 11,
        color: '#00B1FC',
    },
    statsBanner: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        marginHorizontal: 20,
        borderRadius: 24,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 25,
    },
    bannerStat: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        color: 'white',
    },
    statLab: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    bannerDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#334155',
        alignSelf: 'center',
    },
    visibilityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B60',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 30,
        justifyContent: 'space-between',
    },
    visibilityText: {
        flex: 1,
    },
    visTitle: {
        fontSize: 15,
        color: 'white',
    },
    visSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    menuSection: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 12,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 24,
        marginBottom: 12,
    },
    menuGroup: {
        backgroundColor: '#1E293B',
        marginHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    menuIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: 'white',
    },
    logoutBtn: {
        marginHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 20,
        backgroundColor: '#EF444410',
        borderWidth: 1,
        borderColor: '#EF444430',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 15,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
    },
    version: {
        fontSize: 11,
        color: '#475569',
    },
    supportLink: {
        fontSize: 11,
        color: '#00B1FC',
        marginTop: 8,
        fontWeight: 'bold',
    }
});

export default TopperProfile;
