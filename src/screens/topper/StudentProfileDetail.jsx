import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { useGetPublicProfileQuery } from '../../features/api/studentApi';
import Loader from '../../components/Loader';
import ScreenLoader from '../../components/ScreenLoader';

const StudentProfileDetail = ({ route, navigation }) => {
    const { studentId } = route.params;
    const { data: profile, isLoading, isError, refetch } = useGetPublicProfileQuery(studentId);

    if (isLoading) return <ScreenLoader />;

    if (isError || !profile) return (
        <View style={styles.center}>
            <AppText style={{ color: '#EF4444' }}>Failed to load student profile</AppText>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
                <AppText style={{ color: 'white' }}>Retry</AppText>
            </TouchableOpacity>
        </View>
    );

    const renderStat = (icon, label, value, color) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View>
                <AppText style={styles.statVal} weight="bold">{value}</AppText>
                <AppText style={styles.statLab}>{label}</AppText>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header / Banner Area */}
                <View style={styles.headerBanner}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileInfoContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={profile.profilePhoto ? { uri: profile.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.avatar}
                        />
                    </View>

                    <AppText style={styles.studentName} weight="bold">{profile.fullName}</AppText>
                    <View style={styles.badgeRow}>
                        <View style={styles.classBadge}>
                            <AppText style={styles.badgeText}>Class {profile.class}</AppText>
                        </View>
                        <View style={[styles.classBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <AppText style={[styles.badgeText, { color: '#3B82F6' }]}>{profile.board}</AppText>
                        </View>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">Learning Activity</AppText>
                    <View style={styles.statsGrid}>
                        {renderStat('notebook-check-outline', 'Notes Bought', profile.stats?.notesPurchased || 0, '#10B981')}
                        {renderStat('clock-outline', 'Last Active', profile.stats?.lastActive ? new Date(profile.stats.lastActive).toLocaleDateString() : 'Active Now', '#3B82F6')}
                    </View>
                </View>

                {/* Academic Details */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">Academic Details</AppText>
                    <View style={styles.detailCard}>
                        <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Stream</AppText>
                            <AppText style={styles.detailVal}>{profile.stream || 'General'}</AppText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailItem}>
                            <AppText style={styles.detailLabel}>Medium</AppText>
                            <AppText style={styles.detailVal}>{profile.medium || 'English'}</AppText>
                        </View>
                    </View>
                </View>

                {/* Subjects */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">Subjects Studying</AppText>
                    <View style={styles.subjectsContainer}>
                        {profile.subjects?.map((subject, index) => (
                            <View key={index} style={styles.subjectChip}>
                                <AppText style={styles.subjectText}>{subject}</AppText>
                            </View>
                        ))}
                    </View>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    retryBtn: {
        marginTop: 20,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerBanner: {
        height: 120,
        backgroundColor: '#1E293B',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 30,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#0F172A',
        overflow: 'hidden',
        backgroundColor: '#1E293B',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    studentName: {
        fontSize: 22,
        color: 'white',
        marginTop: 15,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    classBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statVal: {
        fontSize: 14,
        color: 'white',
    },
    statLab: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },
    detailCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    detailLabel: {
        color: '#64748B',
        fontSize: 14,
    },
    detailVal: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 5,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    subjectChip: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    subjectText: {
        color: 'white',
        fontSize: 13,
    }
});

export default StudentProfileDetail;
