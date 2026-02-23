import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useGetPurchasedNotesQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { getDownloadedNotes, deleteDownloadedNote } from '../../helpers/downloadService';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import NoDataFound from '../../components/NoDataFound';
import Loader from '../../components/Loader';
import { Theme } from '../../theme/Theme';
import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');

const MyLibrary = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch(500);
    const [activeTab, setActiveTab] = useState('Purchases'); // 'Purchases' or 'Downloaded'
    const [page, setPage] = useState(1);
    const [allNotes, setAllNotes] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const {
        data: purchasedData,
        isLoading,
        isFetching,
        isError,
        error,
        isSuccess,
        refetch,
    } = useGetPurchasedNotesQuery({
        search: searchQuery,
        page: page,
        limit: 10
    });

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
        setAllNotes([]);
        setHasMore(true);
    }, [searchQuery]);

    // Handle data accumulation
    useEffect(() => {
        if (isSuccess && purchasedData) {
            if (page === 1) {
                setAllNotes(purchasedData.notes);
            } else {
                setAllNotes(prev => [...prev, ...purchasedData.notes]);
            }
            // Check if we have more pages
            setHasMore(purchasedData.page < purchasedData.totalPages);
        }
    }, [isSuccess, purchasedData, page]);

    const { refreshing, onRefresh } = useRefresh(async () => {
        setPage(1);
        setHasMore(true);
        await refetch();
    });

    const [downloadedNotes, setDownloadedNotes] = useState([]);

    const fetchDownloads = useCallback(async () => {
        const downloads = await getDownloadedNotes();
        setDownloadedNotes(downloads);
    }, []);

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDownloads();
            if (isSuccess || isError) {
                setPage(1);
                refetch();
            }
        }, [refetch, isSuccess, isError, fetchDownloads])
    );

    useEffect(() => {
        if (isError) {
            showAlert(
                "Error",
                error?.data?.message || "Failed to load your library. Please try again.",
                "error"
            );
        }
    }, [isError, error]);

    const handleLoadMore = () => {
        if (activeTab === 'Purchases' && !isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handleDeleteDownload = (id) => {
        showAlert(
            "Delete Download",
            "Are you sure you want to remove this note from offline storage?",
            "warning",
            {
                showCancel: true,
                confirmText: "Delete",
                onConfirm: async () => {
                    await deleteDownloadedNote(id);
                    fetchDownloads();
                }
            }
        );
    };

    const renderNoteCard = ({ item }) => {
        const isOffline = activeTab === 'Downloaded' || downloadedNotes.some(d => d.id === item._id || d.id === item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.textSection}>
                        {isOffline && (
                            <View style={styles.offlineBadge}>
                                <Ionicons name="cloud-done-outline" size={14} color="#10B981" />
                                <AppText style={[styles.offlineText, { color: '#10B981' }]}>DOWNLOADED</AppText>
                            </View>
                        )}
                        {!isOffline && (
                            <View style={styles.offlineBadge}>
                                <Ionicons name="cloud-download-outline" size={14} color="#00B1FC" />
                                <AppText style={styles.offlineText}>AVAILABLE OFFLINE</AppText>
                            </View>
                        )}

                        <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>
                            {item.title || `${item.subject} Notes`}
                        </AppText>

                        <AppText style={styles.topperName} numberOfLines={1}>
                            By {item.topperName || 'Verified Topper'}
                        </AppText>

                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.readButton}
                                onPress={() => navigation.navigate('NotePreview', { noteId: item._id || item.id, isLocal: activeTab === 'Downloaded' })}
                            >
                                <AppText style={styles.readButtonText} weight="bold">Read Now</AppText>
                            </TouchableOpacity>

                            {activeTab === 'Downloaded' && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => handleDeleteDownload(item.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.imageSection}>
                        <Image
                            source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/topper.avif')}
                            style={styles.noteImage}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <AppText style={styles.headerTitle} weight="bold">My Library</AppText>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="ellipsis-vertical" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Search my notes..."
                    containerStyle={styles.searchContainer}
                />

                {/* Segmented Control / Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Purchases' && styles.activeTab]}
                        onPress={() => setActiveTab('Purchases')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'Purchases' && styles.activeTabText]} weight="bold">
                            All Purchases
                        </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Downloaded' && styles.activeTab]}
                        onPress={() => setActiveTab('Downloaded')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'Downloaded' && styles.activeTabText]} weight="bold">
                            Downloaded
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={activeTab === 'Purchases' ? allNotes : downloadedNotes}
                renderItem={renderNoteCard}
                keyExtractor={(item, index) => `${item._id || item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                    />
                }
                ListFooterComponent={
                    isFetching && page > 1 ? (
                        <ActivityIndicator size="small" color="#00B1FC" style={{ marginVertical: 20 }} />
                    ) : null
                }
                ListEmptyComponent={
                    (isLoading || (isFetching && page === 1)) ? (
                        <View style={{ marginTop: 60, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                        </View>
                    ) : (
                        <NoDataFound
                            message={
                                activeTab === 'Purchases'
                                    ? (searchQuery ? "No matching notes found." : "You haven't purchased any notes yet.")
                                    : "No downloaded notes found offline."
                            }
                            containerStyle={{ width: '100%', marginTop: 60 }}
                        />
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        color: 'white',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 4,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#0F172A',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 14,
        color: '#94A3B8',
    },
    activeTabText: {
        color: 'white',
    },
    listContent: {
        paddingHorizontal: Theme.layout.screenPadding,
        paddingBottom: 100,
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textSection: {
        flex: 1,
        paddingRight: 10,
        justifyContent: 'center',
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    offlineText: {
        fontSize: 10,
        color: '#00B1FC',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    noteTitle: {
        fontSize: 18,
        color: 'white',
        marginBottom: 4,
    },
    topperName: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 15,
    },
    readButton: {
        backgroundColor: '#00B1FC',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    readButtonText: {
        color: 'white',
        fontSize: 14,
    },
    imageSection: {
        width: 100,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#334155',
    },
    noteImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    deleteBtn: {
        padding: 5,
    }
});

export default MyLibrary;
