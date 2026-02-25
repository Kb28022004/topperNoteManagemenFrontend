import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import NoDataFound from '../../components/NoDataFound';
import { useGetNoteReviewsQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';

const AllNoteReviews = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { data, isLoading, isError, refetch } = useGetNoteReviewsQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);

    const reviews = data?.reviews || [];

    if (isLoading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFD700" />
        </View>
    );

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => item.studentId && navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
        >
            <View style={styles.reviewHeader}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.reviewerAvatar}
                />
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user}</AppText>
                    <View style={styles.row}>
                        <AppText style={styles.reviewDate}>{item.daysAgo}</AppText>
                        {item.verifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-seal" size={12} color="#10B981" />
                                <AppText style={styles.verifiedText}>Verified Purchase</AppText>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <AppText style={styles.ratingText} weight="bold">{item.rating}</AppText>
                </View>
            </View>
            <AppText style={styles.reviewComment}>{item.comment}</AppText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <View>
                    <AppText style={styles.headerTitle} weight="bold">Student Reviews</AppText>
                    <AppText style={styles.headerSub}>{data?.total || 0} Total Feedback</AppText>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFD700"
                    />
                }
                ListEmptyComponent={
                    <NoDataFound
                        message="No reviews yet for this note."
                        icon="chatbox-outline"
                    />
                }
                renderItem={renderReviewItem}
            />
        </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    headerSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#334155',
    },
    reviewerName: {
        color: 'white',
        fontSize: 15,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewDate: {
        color: '#64748B',
        fontSize: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 13,
    },
    reviewComment: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
    }
});

export default AllNoteReviews;
