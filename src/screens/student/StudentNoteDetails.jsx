import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    FlatList,
    TextInput,
    Modal,
    Share,
    RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import Loader from '../../components/Loader';
import { useGetNoteDetailsQuery, useAddReviewMutation } from '../../features/api/noteApi';
import { useFollowTopperMutation, topperApi } from '../../features/api/topperApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '../../features/api/paymentApi';
import { useDispatch } from 'react-redux';
import { useAlert } from '../../context/AlertContext';
import useRefresh from '../../hooks/useRefresh';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadNote, isNoteDownloaded } from '../../helpers/downloadService';
import { Theme } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const StudentNoteDetails = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { data: note, isLoading, isError, refetch } = useGetNoteDetailsQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);
    const [followTopper, { isLoading: isFollowLoading }] = useFollowTopperMutation();
    const [addReview, { isLoading: isReviewing }] = useAddReviewMutation();

    // Payment Hooks
    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
    const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();

    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [user, setUser] = useState(null);

    const [following, setFollowing] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const { showAlert } = useAlert();
    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
        }
        loadUser();
    }, []);

    useEffect(() => {
        if (note) {
            setFollowing(note.isFollowing);
            const checkDownload = async () => {
                const status = await isNoteDownloaded(note.id);
                setIsDownloaded(status);
            };
            checkDownload();
        }
    }, [note]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out these amazing notes on ToppersNote: ${note?.title}`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    if (isLoading) return <Loader visible />;
    if (isError) return (
        <View style={styles.center}>
            <AppText style={{ color: '#EF4444' }}>Failed to load note details</AppText>
            <ReusableButton title="Retry" onPress={refetch} style={{ marginTop: 20, width: 120 }} />
        </View>
    );

    const {
        title,
        subject,
        chapterName,
        previewImages,
        price,
        description,
        topper,
        isPurchased,
        reviews,
        rating: avgRating,
        reviewCount,
        pageCount,
        language = "English",
        pdfSize = "12 MB",
        tableOfContents = []
    } = note;


    const handleFollow = async () => {
        try {
            const result = await followTopper(topper.id).unwrap();
            setFollowing(!following);
            // showAlert("Success", result.message, "success");
        } catch (error) {
            console.log("Follow Error", error);
            showAlert("Error", "Failed to update follow status", "error");
        }
    };


    const handleSubmitReview = async () => {
        try {
            await addReview({ noteId, review: { rating, comment } }).unwrap();
            setReviewModalVisible(false);
            setComment('');
            setRating(5);
            showAlert("Success", "Review added successfully!", "success");

            // Invalidate Topper Profile Cache (since rating updated)
            if (topper?.id) {
                dispatch(topperApi.util.invalidateTags([{ type: 'PublicTopper', id: topper.id }]));
            }
        } catch (error) {
            console.log("Review Error:", error);
            const errorMessage = error?.data?.message || "Failed to add review";
            showAlert("Error", errorMessage, "error");
        }
    };

    const handleDownload = async () => {
        if (isDownloaded) {
            showAlert("In-App Offline", "This note is already downloaded and available in your library for offline access.", "success");
            return;
        }

        try {
            setIsDownloading(true);
            setDownloadProgress(0);

            await downloadNote(note, (progress) => {
                setDownloadProgress(progress);
            });

            setIsDownloaded(true);
            setIsDownloading(false);
            showAlert("Success", "Note downloaded for offline access! You can find it in 'My Library' under the Downloaded tab.", "success");
        } catch (error) {
            console.error("Download Error:", error);
            setIsDownloading(false);
            showAlert("Error", "Failed to download note. Please try again.", "error");
        }
    };

    const handlePurchase = async () => {
        try {
            // 1. Create Order
            const orderData = await createOrder(noteId).unwrap();
            const { orderId, amount, key } = orderData.data;

            console.log("Order Created:", orderData);

            // 2. Open Razorpay Checkout (Simulated for now)
            // Ideally: use RazorpayCheckout.open({ ...options })

            // SIMULATING SUCCESSFUL PAYMENT RESPONSE
            const mockPaymentResponse = {
                razorpay_order_id: orderId,
                razorpay_payment_id: `pay_${Date.now()}`, // Mock ID
                razorpay_signature: "mock_signature_bypass" // Needs backend bypass or real SDK
            };

            showAlert(
                "Payment Gateway",
                "Simulating Payment Gateway... (Dev Mode)\n\nThis bypasses actual payment for testing.",
                "info",
                {
                    showCancel: true,
                    confirmText: "Confirm Payment",
                    onConfirm: async () => {
                        try {
                            // 3. Verify Payment
                            await verifyPayment(mockPaymentResponse).unwrap();
                            showAlert("Success", "Payment Successful! Note unlocked.", "success");
                            refetch(); // Refresh to update 'isPurchased'
                        } catch (err) {
                            console.log("Payment Verification Error", err);
                            showAlert("Error", "Payment verification failed", "error");
                        }
                    }
                }
            );

            // FOR REAL INTEGRATION:
            // Since we can't link native modules, we are stuck. 
            // I will enable a 'Bypass' in backend ONLY for this mock signature to allow flow completion.
            // Alert.alert("Payment", "Please integrate Razorpay SDK for real payments. Backend is ready.");

        } catch (error) {
            console.log("Purchase Error", error);
            showAlert("Error", "Failed to initiate purchase", "error");
        }
    };

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}>
                    <AppText style={styles.avatarText}>{item.user?.charAt(0) || 'S'}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                    <AppText style={styles.reviewerName} weight="bold">{item.user || 'Student'}</AppText>
                    <AppText style={styles.reviewDate}>{item?.daysAgo}</AppText>
                </View>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={12} color="#FFD700" />
                    ))}
                </View>
            </View>
            <AppText style={styles.reviewComment}>{item.comment}</AppText>
            {item.verifiedPurchase && (
                <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={12} color="#10B981" />
                    <AppText style={styles.verifiedText}>Verified Purchase</AppText>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Note Details</AppText>
                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                    <Ionicons name="share-social-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >

                {/* Preview Image */}
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: previewImages && previewImages.length > 0 ? previewImages[0] : null }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay} />

                    <View style={styles.bestSellerBadge}>
                        <AppText style={styles.bestSellerText}>BEST SELLER</AppText>
                    </View>

                    <TouchableOpacity
                        style={styles.previewBtn}
                        onPress={() => navigation.navigate('NotePreview', { noteId })}
                    >
                        <Ionicons name={isPurchased ? "book-outline" : "eye"} size={20} color="white" style={{ marginRight: 8 }} />
                        <AppText style={styles.previewBtnText}>
                            {isPurchased ? "Read Full Notes" : "Watermarked Preview"}
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.contentBody}>

                    {/* Title & Rating */}
                    <AppText style={styles.title} weight="bold">{title}</AppText>
                    <View style={styles.ratingMeta}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <AppText style={styles.ratingValue} weight="bold">{avgRating}</AppText>
                        <View style={styles.dot} />
                        <AppText style={styles.reviewCount}>{reviewCount || 0} Reviews</AppText>
                    </View>

                    {/* Topper Card */}
                    <View style={styles.topperCard}>
                        <Image source={topper?.profilePhoto ? { uri: topper?.profilePhoto } : require('../../../assets/topper.avif')} style={styles.topperImage} />
                        <View style={styles.topperInfo}>
                            <View style={styles.row}>
                                <AppText style={styles.topperName} weight="bold">{topper?.name}</AppText>
                                <TouchableOpacity
                                    style={[styles.badge, following ? { backgroundColor: '#334155' } : { backgroundColor: '#3B82F6' }]}
                                    onPress={handleFollow}
                                    disabled={isFollowLoading}
                                >
                                    <AppText style={styles.badgeText}>
                                        {following ? "Following" : "Follow"}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                            <AppText style={styles.topperBio}>{topper?.bio}</AppText>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('PublicTopperProfile', { topperId: topper.id })}>
                            <AppText style={styles.viewProfileText} weight="bold">View Profile</AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                            <AppText style={styles.statValue} weight="bold">{pageCount || 0}</AppText>
                            <AppText style={styles.statLabel}>Pages</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="translate" size={24} color="#3B82F6" />
                            <AppText style={styles.statValue} weight="bold">{language || "English"}</AppText>
                            <AppText style={styles.statLabel}>Language</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#3B82F6" />
                            <AppText style={styles.statValue} weight="bold">{pdfSize || "0MB"}</AppText>
                            <AppText style={styles.statLabel}>PDF Size</AppText>
                        </View>
                    </View>

                    {/* Description */}
                    <AppText style={styles.sectionTitle} weight="bold">Description</AppText>
                    <AppText style={styles.descriptionText}>{description || "No description available"}</AppText>

                    {/* Table of Contents */}
                    <AppText style={styles.sectionTitle} weight="bold">Table of Contents</AppText>
                    <View style={styles.tocList}>
                        {tableOfContents.map((chapter, index) => (
                            <View key={index} style={styles.tocItem}>
                                <View style={styles.chapterNumberBox}>
                                    <AppText style={styles.chapterNumber}>{index + 1}</AppText>
                                </View>
                                <AppText style={styles.chapterTitle} numberOfLines={1}>{chapter.title}</AppText>
                                <AppText style={styles.chapterPage}>{chapter.pageNumber}</AppText>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.showAllChapters}>
                            <AppText style={styles.showAllText}>Show All Chapters</AppText>
                            <Ionicons name="chevron-down" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>


                    {/* Reviews */}
                    <View style={styles.rowBetween}>
                        <AppText style={styles.sectionTitle} weight="bold">Reviews & Ratings</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            {isPurchased && (
                                <TouchableOpacity onPress={() => setReviewModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="create-outline" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                                    <AppText style={styles.seeAllText}>Write Review</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {reviews && reviews.length > 0 ? (
                        <FlatList
                            data={reviews}
                            renderItem={renderReviewItem}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false} // Since inside ScrollView
                            contentContainerStyle={{ gap: 15 }}
                        />
                    ) : (
                        <AppText style={styles.noReviewsText}>No reviews yet.</AppText>
                    )}

                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <View style={styles.priceRow}>
                        <AppText style={styles.finalPrice} weight="bold">₹{price?.current}</AppText>
                        <AppText style={styles.discountText}>{price?.discount}</AppText>
                    </View>
                    <AppText style={styles.strikePrice}>₹{price?.original}</AppText>
                </View>

                {isPurchased ? (
                    <TouchableOpacity
                        style={[styles.downloadBtnLarge, isDownloaded && { backgroundColor: '#10B981' }]}
                        onPress={handleDownload}
                        disabled={isDownloading}
                    >
                        <Ionicons
                            name={isDownloading ? "cloud-download" : (isDownloaded ? "cloud-done" : "cloud-download-outline")}
                            size={20}
                            color="white"
                        />
                        <AppText style={styles.downloadBtnText} weight="bold">
                            {isDownloading ? `Downloading ${Math.round(downloadProgress * 100)}%` : (isDownloaded ? "Offline Ready" : "Download PDF")}
                        </AppText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.unlockBtn}
                        onPress={handlePurchase}
                        disabled={isCreatingOrder || isVerifyingPayment}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.unlockGradient}
                        >
                            {isCreatingOrder ? (
                                <AppText style={styles.unlockText} weight="bold">Processing...</AppText>
                            ) : (
                                <>
                                    <Ionicons name="lock-open" size={18} color="white" />
                                    <AppText style={styles.unlockText} weight="bold">Unlock Full Notes</AppText>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            {/* Review Modal (Same as before) */}
            <Modal visible={reviewModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText style={styles.modalTitle} weight="bold">Write a Review</AppText>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color="#FFD700" />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Share your feedback..."
                            placeholderTextColor="#64748B"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={styles.cancelBtn}>
                                <AppText style={{ color: '#94A3B8' }}>Cancel</AppText>
                            </TouchableOpacity>
                            <ReusableButton
                                title={isReviewing ? "Submitting..." : "Submit"}
                                onPress={handleSubmitReview}
                                style={{ width: 120 }}
                                disabled={isReviewing}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 15,
        backgroundColor: '#0F172A',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
    },
    iconBtn: {
        padding: 8,
    },
    scrollContent: {
        paddingTop: 90, // Make space for header
        paddingBottom: 120, // Make space for footer
    },
    previewContainer: {
        height: 520, // Taller image
        width: width,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#1E293B'
    },
    previewImage: {
        width: '80%',
        height: '90%',
        borderRadius: 8,
        transform: [{ rotate: '2deg' }], // Slight creative tilt
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.3)' // Subtle overlay
    },
    bestSellerBadge: {
        position: 'absolute',
        top: 20,
        right: 30,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
        zIndex: 2,
    },
    bestSellerText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    previewBtn: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)', // Only works on supported platforms, ignored on others
    },
    previewBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    contentBody: {
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        color: 'white',
        lineHeight: 32,
        marginBottom: 10,
    },
    ratingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    ratingValue: {
        color: 'white',
        fontSize: 14,
        marginLeft: 6,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#64748B',
        marginHorizontal: 8,
    },
    reviewCount: {
        color: '#94A3B8',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        marginBottom: 25,
    },
    topperImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    topperInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topperName: {
        color: 'white',
        fontSize: 16,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    topperBio: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 2,
    },
    viewProfileText: {
        color: '#3B82F6',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 4,
        justifyContent: 'center',
        height: 100,
    },
    statValue: {
        color: 'white',
        fontSize: 16,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 12,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        marginBottom: 12,
    },
    descriptionText: {
        color: '#94A3B8',
        fontSize: 14,
        lineHeight: 24,
        marginBottom: 30,
    },
    tocList: {
        marginBottom: 30,
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    chapterNumberBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chapterNumber: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chapterTitle: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    chapterPage: {
        color: '#64748B',
        fontSize: 12,
    },
    showAllChapters: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    showAllText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllText: {
        color: '#3B82F6',
        fontSize: 14,
    },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8B5CF6', // Purple avatar
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    reviewerName: {
        color: 'white',
        fontSize: 14,
        marginBottom: 2,
    },
    reviewDate: {
        color: '#64748B',
        fontSize: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '500',
    },
    noReviewsText: {
        color: '#64748B',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0F172A', // Dark background
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    finalPrice: {
        color: 'white',
        fontSize: 24,
    },
    discountText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: 'bold',
    },
    strikePrice: {
        color: '#64748B',
        fontSize: 14,
        textDecorationLine: 'line-through',
    },
    unlockBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        width: 180,
    },
    unlockGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    downloadBtnLarge: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 180,
        gap: 8,
    },
    downloadBtnText: {
        color: 'white',
        fontSize: 14,
    },
    unlockText: {
        color: 'white',
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    commentInput: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 15,
        color: 'white',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelBtn: {
        padding: 15,
    },
});

export default StudentNoteDetails;
