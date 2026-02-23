import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { Theme } from '../../theme/Theme';
import { useAlert } from '../../context/AlertContext';
import { useDeleteAccountMutation } from '../../features/api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';

const AccountSettings = ({ navigation }) => {
    const { showAlert } = useAlert();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const handleDeleteAccount = () => {
        showAlert(
            "Delete Account",
            "This action is permanent and cannot be undone. All your purchases and data will be lost.",
            "error",
            {
                showCancel: true,
                confirmText: "Delete Forever",
                onConfirm: async () => {
                    try {
                        await deleteAccount().unwrap();
                        await AsyncStorage.clear();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    } catch (error) {
                        showAlert("Error", "Failed to delete account. Please try again later.", "error");
                    }
                }
            }
        );
    };

    const settingSections = [
        {
            title: "PROFILE SETTINGS",
            items: [
                {
                    id: 'academic',
                    title: "Academic Profile",
                    subtitle: "Update Class, Board & Stream",
                    icon: "school-outline",
                    color: "#3B82F6",
                    onPress: () => navigation.navigate('EditAcademicProfile')
                },
                {
                    id: 'notifications',
                    title: "Notifications",
                    subtitle: "Preferences for alerts & news",
                    icon: "notifications-outline",
                    color: "#10B981"
                },
            ]
        },
        {
            title: "SUPPORT",
            items: [
                {
                    id: 'help',
                    title: "Help & Support",
                    subtitle: "Contact us for any issues",
                    icon: "help-circle-outline",
                    color: "#F59E0B"
                },
                {
                    id: 'privacy',
                    title: "Privacy Policy",
                    subtitle: "How we handle your data",
                    icon: "shield-checkmark-outline",
                    color: "#6366F1"
                },
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Loader visible={isDeleting} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Account Settings</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {settingSections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.section}>
                        <AppText style={styles.sectionTitle} weight="bold">{section.title}</AppText>
                        <View style={styles.card}>
                            {section.items.map((item, iIndex) => (
                                <TouchableOpacity
                                    key={iIndex}
                                    style={[styles.item, iIndex === section.items.length - 1 && { borderBottomWidth: 0 }]}
                                    onPress={item.onPress}
                                >
                                    <View style={styles.itemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                            <Ionicons name={item.icon} size={22} color={item.color} />
                                        </View>
                                        <View>
                                            <AppText style={styles.itemTitle} weight="medium">{item.title}</AppText>
                                            <AppText style={styles.itemSubtitle}>{item.subtitle}</AppText>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#4B5563" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">DANGER ZONE</AppText>
                    <TouchableOpacity style={styles.deleteCard} onPress={handleDeleteAccount}>
                        <View style={styles.itemLeft}>
                            <View style={styles.deleteIconContainer}>
                                <Feather name="trash-2" size={20} color="#EF4444" />
                            </View>
                            <View>
                                <AppText style={styles.deleteTitle} weight="bold">Delete Account</AppText>
                                <AppText style={styles.deleteSubtitle}>Permanently remove all your data</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.footer}>
                    <AppText style={styles.versionText}>TopperNotes Mobile • v1.0.0</AppText>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
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
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#64748B',
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        color: 'white',
        fontSize: 16,
    },
    itemSubtitle: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 2,
    },
    deleteCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    deleteIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteTitle: {
        color: '#EF4444',
        fontSize: 16,
    },
    deleteSubtitle: {
        color: 'rgba(239, 68, 68, 0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        color: '#4B5563',
        fontSize: 12,
    }
});

export default AccountSettings;
