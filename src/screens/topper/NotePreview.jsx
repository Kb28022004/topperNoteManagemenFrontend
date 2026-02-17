import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ScreenCapture from 'expo-screen-capture';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../../components/AppText';
import { useGetNoteDetailsQuery } from '../../features/api/noteApi';
import Loader from '../../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const NotePreview = ({ route, navigation }) => {
    const { noteId } = route.params;
    const { data: note, isLoading, refetch } = useGetNoteDetailsQuery(noteId);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [userData, setUserData] = useState(null);

    // 0. Safety: Guarded Refetch on focus
    useFocusEffect(
        React.useCallback(() => {
            if (note) {
                refetch?.();
            }
        }, [note, refetch])
    );

    // 1. Protection: Prevent Screenshots & Recording
    useEffect(() => {
        const protect = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        protect();

        // Allow screenshots again when leaving the screen
        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    // 2. Load User Data for Watermark
    useEffect(() => {
        const loadUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) setUserData(JSON.parse(userStr));
        };
        loadUser();
    }, []);

    if (isLoading) return <Loader visible />;

    const previewImages = note?.previewImages || [];
    const totalPages = note?.pageCount || 0;
    const isPurchased = note?.isPurchased;
    const hasMorePages = totalPages > previewImages.length;

    const handleBuyNow = () => {
        // Navigation to payment or checkout
        Alert.alert("Unlock Full Access", `Purchase this note for ₹${note?.price?.current} to view all ${totalPages} pages and download the PDF.`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>
                        {note?.subject}: {note?.chapterName}
                    </AppText>
                    <View style={styles.topperRow}>
                        <AppText style={styles.topperText}>Topper: </AppText>
                        <AppText style={styles.topperName} weight="bold">{note?.topper?.name}</AppText>
                    </View>
                </View>
                <View style={styles.pageIndicatorBox}>
                    <AppText style={styles.pageCountText}>{currentPageIndex + 1} / {previewImages.length}</AppText>
                </View>
            </View>

            {/* Note Content */}
            <View style={styles.contentContainer}>
                <View style={styles.imageWrapper}>
                    {previewImages.length > 0 ? (
                        <Image
                            source={{ uri: previewImages[currentPageIndex] }}
                            style={styles.noteImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <AppText style={{ color: '#64748B' }}>No preview pages available</AppText>
                        </View>
                    )}

                    {/* Dynamic Watermark Overlay (Repeated for security) */}
                    <View style={styles.watermarkLayer} pointerEvents="none">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <View key={i} style={[styles.watermarkRow, { marginTop: i * 80 }]}>
                                <AppText style={styles.watermarkText}>
                                    UID: {userData?.id?.slice(-6) || 'STUDENT'} • UNAUTHORIZED SHARING PROHIBITED • PROPERTY OF TOPPERSNOTE
                                </AppText>
                            </View>
                        ))}
                    </View>

                    {/* Protected Content Badge */}
                    <View style={styles.protectedBadge}>
                        <Ionicons name="lock-closed" size={14} color="white" style={{ marginRight: 6 }} />
                        <AppText style={styles.protectedText}>Protected Content</AppText>
                    </View>
                </View>
            </View>

            {/* Footer / Controls */}
            <View style={styles.footer}>
                {!isPurchased && hasMorePages && (
                    <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
                        <LinearGradient
                            colors={['#00B1FC', '#007FFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buyGradient}
                        >
                            <Ionicons name="cart-outline" size={20} color="white" />
                            <AppText style={styles.buyBtnText} weight="bold">Unlock {totalPages - previewImages.length} more pages - ₹{note?.price?.current}</AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <View style={styles.pageSliderRow}>
                    <AppText style={styles.pageLabel}>Page {currentPageIndex + 1}</AppText>
                    <AppText style={styles.pageLabel}>{previewImages.length} Pages Available</AppText>
                </View>

                {previewImages.length > 1 && (
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={previewImages.length - 1}
                        step={1}
                        value={currentPageIndex}
                        onValueChange={setCurrentPageIndex}
                        minimumTrackTintColor="#00B1FC"
                        maximumTrackTintColor="#1E293B"
                        thumbTintColor="#00B1FC"
                    />
                )}

                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtn}>
                        <Feather name="grid" size={22} color="#94A3B8" />
                    </TouchableOpacity>

                    <View style={styles.screenshotBlocked}>
                        <MaterialCommunityIcons name="eye-off-outline" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                        <AppText style={styles.blockedText}>SCREEN RECORDING BLOCKED</AppText>
                    </View>

                    <TouchableOpacity style={styles.controlBtn} disabled={!isPurchased}>
                        <Feather name="download" size={22} color={isPurchased ? "#00B1FC" : "#334155"} />
                    </TouchableOpacity>
                </View>
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0F172A',
    },
    backBtn: {
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    noteTitle: {
        color: 'white',
        fontSize: 14,
    },
    topperRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topperText: {
        color: '#64748B',
        fontSize: 11,
    },
    topperName: {
        color: '#94A3B8',
        fontSize: 11,
    },
    pageIndicatorBox: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pageCountText: {
        color: '#94A3B8',
        fontSize: 12,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    imageWrapper: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteImage: {
        width: '100%',
        height: '100%',
    },
    watermarkLayer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 40,
        opacity: 0.15,
    },
    watermarkRow: {
        transform: [{ rotate: '-30deg' }],
        padding: 10,
    },
    watermarkText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    protectedBadge: {
        position: 'absolute',
        top: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    protectedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    buyBtn: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#00B1FC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buyGradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    buyBtnText: {
        color: 'white',
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40, // Increased for safe area
        paddingTop: 10,
    },
    pageSliderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    pageLabel: {
        color: '#64748B',
        fontSize: 12,
    },
    slider: {
        width: '100%',
        height: 40,
        marginBottom: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    controlBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenshotBlocked: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    blockedText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default NotePreview;
