import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AppText from '../../components/AppText';
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from '../../components/ReausableButton';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useFocusEffect } from '@react-navigation/native';

const TopperApprovalPending = ({ navigation }) => {
    const { data: profileData, isLoading, refetch, isFetching } = useGetProfileQuery();

    useFocusEffect(
        React.useCallback(() => {
            refetch?.();
        }, [refetch])
    );

    const status = profileData?.data?.status || 'PENDING';
    const remark = profileData?.data?.adminRemark || "Your marksheet or details don't meet our topper criteria.";

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ed8936" />
                </View>
            );
        }

        switch (status) {
            case 'APPROVED':
                return (
                    <>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(72, 187, 120, 0.1)' }]}>
                            <Ionicons name="checkmark-circle" size={80} color="#48bb78" />
                        </View>
                        <AppText style={styles.title}>Account Approved!</AppText>
                        <AppText style={styles.subtitle}>
                            Congratulations! Your profile has been verified. You can now start uploading your notes and building your community.
                        </AppText>
                        <ReusableButton
                            title="Go to Dashboard"
                            onPress={() => navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            })}
                            style={[styles.button, { backgroundColor: '#48bb78' }]}
                            icon="speedometer"
                        />
                    </>
                );

            case 'REJECTED':
                return (
                    <>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 101, 101, 0.1)' }]}>
                            <Ionicons name="close-circle" size={80} color="#f56565" />
                        </View>
                        <AppText style={styles.title}>Verification Failed</AppText>
                        <AppText style={styles.subtitle}>
                            Unfortunately, your request could not be approved at this time.
                        </AppText>

                        <View style={styles.reasonBox}>
                            <AppText style={styles.reasonLabel}>Reason for Rejection:</AppText>
                            <AppText style={styles.reasonText}>{remark}</AppText>
                        </View>

                        <ReusableButton
                            title="Update & Re-verify"
                            onPress={() => navigation.navigate('TopperVerification')}
                            style={[styles.button, { backgroundColor: '#f56565' }]}
                            icon="refresh"
                        />
                        <TouchableOpacity onPress={refetch} style={{ marginTop: 20 }}>
                            <AppText style={styles.refreshText}>I've updated my profile</AppText>
                        </TouchableOpacity>
                    </>
                );

            default: // PENDING
                return (
                    <>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time" size={80} color="#ed8936" />
                        </View>
                        <AppText style={styles.title}>Approval Pending</AppText>
                        <AppText style={styles.subtitle}>
                            Your profile is currently under review by our admin team.
                            This usually takes 24-48 hours.
                        </AppText>
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={24} color="#63b3ed" />
                            <AppText style={styles.infoText}>
                                You will be notified once your profile is verified. Please check back later.
                            </AppText>
                        </View>
                        <ReusableButton
                            title={isFetching ? "Refreshing..." : "Check Status / Refresh"}
                            onPress={refetch}
                            style={styles.button}
                            icon="sync"
                            disabled={isFetching}
                        />
                    </>
                );
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
                {renderContent()}

                {status !== 'APPROVED' && (
                    <TouchableOpacity onPress={() => navigation.replace('Home')} style={{ marginTop: 25 }}>
                        <AppText style={styles.backHome}>Back to Home (Viewer Mode)</AppText>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#1a202c',
        justifyContent: 'center',
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        backgroundColor: 'rgba(237, 137, 54, 0.1)',
        padding: 30,
        borderRadius: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#a0aec0',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(99, 179, 237, 0.1)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        gap: 15,
        marginBottom: 40,
    },
    infoText: {
        flex: 1,
        color: '#63b3ed',
        fontSize: 14,
        lineHeight: 20,
    },
    reasonBox: {
        width: '100%',
        backgroundColor: 'rgba(245, 101, 101, 0.05)',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 101, 101, 0.2)',
        marginBottom: 30,
    },
    reasonLabel: {
        color: '#f56565',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    reasonText: {
        color: '#cbd5e0',
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        backgroundColor: '#ed8936',
    },
    backHome: {
        color: '#718096',
        fontSize: 14,
        fontWeight: '600'
    },
    refreshText: {
        color: '#63b3ed',
        fontSize: 14,
        fontWeight: '600'
    }
});

export default TopperApprovalPending;
