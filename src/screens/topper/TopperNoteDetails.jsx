import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    RefreshControl,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import { useGetNoteDetailsQuery, useGetNoteBuyersQuery } from '../../features/api/noteApi';
import { useAlert } from '../../context/AlertContext';
import useRefresh from '../../hooks/useRefresh';

const { width } = Dimensions.get('window');

const TopperNoteDetails = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { data: note, isLoading, isError, refetch: refetchNote } = useGetNoteDetailsQuery(noteId);
    const { data: buyers, isLoading: isBuyersLoading, refetch: refetchBuyers } = useGetNoteBuyersQuery(noteId);

    const { refreshing, onRefresh } = useRefresh(async () => {
        await Promise.all([refetchNote(), refetchBuyers()]);
    });
    const { showAlert } = useAlert();

    if (isLoading || isBuyersLoading) return <Loader visible />;
    if (isError || !note) return (
        <View style={styles.center}>
            <AppText style={{ color: '#EF4444' }}>Failed to load note details</AppText>
            <TouchableOpacity
                onPress={() => {
                    refetchNote();
                    refetchBuyers();
                }}
                style={styles.retryBtn}
            >
                <AppText style={{ color: 'white' }}>Retry</AppText>
            </TouchableOpacity>
        </View>
    );

    const {
        title,
        subject,
        chapterName,
        previewImages = [],
        price,
        description,
        status,
        adminRemark,
        rating: avgRating,
        reviewCount,
        pageCount,
        language = "English",
        pdfSize = "0 MB",
        tableOfContents = [],
        salesCount = 0,
        reviews = []
    } = note;

    const totalRevenue = (salesCount || 0) * (price?.current || 0);

    const STATUS_MAP = {
        PUBLISHED: { label: 'Approved', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
        UNDER_REVIEW: { label: 'Pending Review', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
        REJECTED: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };

    const currentStatus = STATUS_MAP[status] || STATUS_MAP.UNDER_REVIEW;

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => item.studentId && navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
        >
            <View style={styles.reviewHeader}>
                <View style={[styles.reviewerAvatar, { backgroundColor: '#3B82F6' }]}>
                    <AppText style={styles.avatarText}>{item.user?.charAt(0) || 'S'}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user || 'Student'}</AppText>
                    <AppText style={styles.reviewDate}>{item?.daysAgo || 'Recently'}</AppText>
                </View>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={12} color="#FFD700" />
                    ))}
                </View>
            </View>
            <AppText style={styles.reviewComment}>{item.comment}</AppText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Note Insights</AppText>
                <TouchableOpacity onPress={() => { }} style={styles.iconBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: currentStatus.bg }]}>
                    <View style={styles.statusDotRow}>
                        <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
                        <AppText style={[styles.statusLabel, { color: currentStatus.color }]} weight="bold">
                            {currentStatus.label}
                        </AppText>
                    </View>
                    {status === 'REJECTED' && adminRemark && (
                        <View style={styles.remarkBox}>
                            <AppText style={styles.remarkTitle} weight="bold">Admin Feedback:</AppText>
                            <AppText style={styles.remarkText}>{adminRemark}</AppText>
                        </View>
                    )}
                </View>

                {/* Performance Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <AppText style={styles.statVal} weight="bold">{buyers?.length || salesCount}</AppText>
                        <AppText style={styles.statLab}>Total Sales</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <AppText style={[styles.statVal, { color: '#10B981' }]} weight="bold">₹{((buyers?.length || salesCount) * (price?.current || 0))}</AppText>
                        <AppText style={styles.statLab}>Revenue</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={styles.ratingRowSmall}>
                            <AppText style={styles.statVal} weight="bold">{avgRating}</AppText>
                            <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />
                        </View>
                        <AppText style={styles.statLab}>{reviewCount} Reviews</AppText>
                    </View>
                </View>

                {/* Preview Image */}
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: previewImages && previewImages.length > 0 ? previewImages[0] : null }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.previewBtn}
                        onPress={() => navigation.navigate('NotePreview', { noteId })}
                    >
                        <Ionicons name="eye-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <AppText style={styles.previewBtnText}>Check Quality</AppText>
                    </TouchableOpacity>
                </View>

                {/* Content Details */}
                <View style={styles.contentBody}>
                    <AppText style={styles.title} weight="bold">{title}</AppText>
                    <AppText style={styles.noteSub}>{subject} • Class {note.class} • {note.board}</AppText>

                    {/* Metadata Grid */}
                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                            <AppText style={styles.metaText}>{pageCount} Pages</AppText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="language-outline" size={20} color="#3B82F6" />
                            <AppText style={styles.metaText}>{language}</AppText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="pricetag-outline" size={20} color="#10B981" />
                            <AppText style={styles.metaText}>₹{price?.current}</AppText>
                        </View>
                    </View>

                    {/* Description */}
                    <AppText style={styles.sectionTitle} weight="bold">Description</AppText>
                    <AppText style={styles.descriptionText}>{description || "No description provided."}</AppText>

                    {/* Table of Contents */}
                    {tableOfContents.length > 0 && (
                        <>
                            <AppText style={styles.sectionTitle} weight="bold">Table of Contents</AppText>
                            <View style={styles.tocList}>
                                {tableOfContents.map((chapter, index) => (
                                    <View key={index} style={styles.tocItem}>
                                        <View style={styles.dot} />
                                        <AppText style={styles.chapterTitle}>{chapter.title}</AppText>
                                        <AppText style={styles.chapterPage}>p.{chapter.pageNumber}</AppText>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Buyers History */}
                    <TouchableOpacity
                        style={styles.rowBetween}
                        onPress={() => navigation.navigate('AllNoteBuyers', { noteId })}
                    >
                        <AppText style={styles.sectionTitle} weight="bold">Who Purchased</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <AppText style={styles.badgeTextCount}>{buyers?.length || 0} Students</AppText>
                            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                        </View>
                    </TouchableOpacity>

                    {buyers && buyers.length > 0 ? (
                        <View style={styles.buyersList}>
                            {buyers.slice(0, 3).map((buyer, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.buyerCard}
                                    onPress={() => navigation.navigate('StudentProfileDetail', { studentId: buyer.studentId })}
                                >
                                    <Image
                                        source={buyer.profilePhoto ? { uri: buyer.profilePhoto } : require('../../../assets/topper.avif')}
                                        style={styles.buyerAvatar}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <AppText style={styles.buyerName} weight="bold">{buyer.studentName}</AppText>
                                        <AppText style={styles.buyerMeta}>Class {buyer.class} • {buyer.board}</AppText>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <AppText style={styles.purchasedDate}>
                                            {new Date(buyer.purchasedAt).toLocaleDateString()}
                                        </AppText>
                                        <AppText style={styles.purchasedTime}>Purchased</AppText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {buyers.length > 3 && (
                                <TouchableOpacity
                                    style={styles.seeMoreBuyers}
                                    onPress={() => navigation.navigate('AllNoteBuyers', { noteId })}
                                >
                                    <AppText style={styles.seeMoreText}>View all {buyers.length} buyers</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.emptySmallBox}>
                            <AppText style={styles.noDataText}>No purchases yet.</AppText>
                        </View>
                    )}

                    {/* Reviews */}
                    <TouchableOpacity
                        style={[styles.rowBetween, { marginTop: 25 }]}
                        onPress={() => navigation.navigate('AllNoteReviews', { noteId })}
                    >
                        <AppText style={styles.sectionTitle} weight="bold">Recent Reviews</AppText>
                        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                    </TouchableOpacity>

                    {reviews && reviews.length > 0 ? (
                        <>
                            <FlatList
                                data={reviews.slice(0, 3)}
                                renderItem={renderReviewItem}
                                keyExtractor={(item, index) => index.toString()}
                                scrollEnabled={false}
                                contentContainerStyle={{ gap: 12 }}
                            />
                            {reviews.length > 3 && (
                                <TouchableOpacity
                                    style={styles.seeMoreBuyers}
                                    onPress={() => navigation.navigate('AllNoteReviews', { noteId })}
                                >
                                    <AppText style={styles.seeMoreText}>View all {reviews.length} reviews</AppText>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <View style={styles.emptyReviewBox}>
                            <Ionicons name="chatbox-outline" size={24} color="#334155" />
                            <AppText style={styles.noReviewsText}>No student reviews yet.</AppText>
                        </View>
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#0F172A',
        zIndex: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
    },
    iconBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    statusBanner: {
        margin: 20,
        padding: 16,
        borderRadius: 16,
    },
    statusDotRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusLabel: {
        fontSize: 14,
    },
    remarkBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    remarkTitle: {
        color: '#EF4444',
        fontSize: 12,
        marginBottom: 4,
    },
    remarkText: {
        color: '#94A3B8',
        fontSize: 13,
        lineHeight: 18,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        marginHorizontal: 20,
        marginBottom: 25,
        borderRadius: 20,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        color: 'white',
    },
    statLab: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#334155',
        alignSelf: 'center',
    },
    ratingRowSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewContainer: {
        height: 380,
        width: width - 40,
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1E293B',
        marginBottom: 25,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    previewBtnText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    contentBody: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        color: 'white',
        marginBottom: 6,
    },
    noteSub: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 20,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 25,
        gap: 15,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    metaText: {
        color: 'white',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        color: 'white',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 22,
        marginBottom: 30,
    },
    tocList: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3B82F6',
        marginRight: 12,
    },
    chapterTitle: {
        flex: 1,
        color: 'white',
        fontSize: 14,
    },
    chapterPage: {
        color: '#64748B',
        fontSize: 12,
    },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewerName: {
        color: 'white',
        fontSize: 14,
    },
    reviewDate: {
        color: '#64748B',
        fontSize: 11,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        color: '#CBD5E1',
        fontSize: 13,
        lineHeight: 20,
    },
    emptyReviewBox: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        gap: 8,
    },
    noReviewsText: {
        color: '#475569',
        fontSize: 13,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    badgeTextCount: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: 'bold',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    buyersList: {
        gap: 12,
    },
    buyerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    buyerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        backgroundColor: '#334155',
    },
    buyerName: {
        color: 'white',
        fontSize: 14,
        marginBottom: 2,
    },
    buyerMeta: {
        color: '#64748B',
        fontSize: 11,
    },
    purchasedDate: {
        color: '#94A3B8',
        fontSize: 11,
        marginBottom: 2,
    },
    purchasedTime: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
    },
    seeMoreBuyers: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    seeMoreText: {
        color: '#3B82F6',
        fontSize: 13,
        fontWeight: '600',
    },
    emptySmallBox: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    noDataText: {
        color: '#475569',
        fontSize: 13,
    }
});

export default TopperNoteDetails;
