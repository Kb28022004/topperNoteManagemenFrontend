import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useGetPurchasedNotesQuery, useGetFavoriteNotesQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { getDownloadedNotes, deleteDownloadedNote } from '../../helpers/downloadService';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import NoDataFound from '../../components/NoDataFound';
import Loader from '../../components/Loader';
import { Theme } from '../../theme/Theme';
import { useAlert } from '../../context/AlertContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MyLibrary = ({ navigation, route }) => {
    const { showAlert } = useAlert();
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch('', 500);
    const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'Purchases'); // 'Purchases', 'Favorites', or 'Downloaded'

    useEffect(() => {
        if (route.params?.initialTab) {
            setActiveTab(route.params.initialTab);
        }
    }, [route.params?.initialTab]);

    // ─── Purchases ────────────────────────────────────────
    const [page, setPage] = useState(1);

    const {
        data: purchasedData,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetPurchasedNotesQuery({
        search: searchQuery,
        page,
        limit: 10
    });

    // ─── Favorites ────────────────────────────────────────
    const [favoritesPage, setFavoritesPage] = useState(1);

    const {
        data: favoritesData,
        isLoading: isFavoritesLoading,
        isFetching: isFavoritesFetching,
        refetch: refetchFavorites
    } = useGetFavoriteNotesQuery({
        search: searchQuery,
        page: favoritesPage,
        limit: 10
    }, {
        skip: activeTab !== 'Favorites'
    });

    // ─── Derived pagination state (from RTK Query cache) ──
    const hasMore = (purchasedData?.pagination?.page || 0) < (purchasedData?.pagination?.totalPages || 0);
    const hasMoreFavorites = (favoritesData?.pagination?.page || 0) < (favoritesData?.pagination?.totalPages || 0);

    // Reset pages when search changes
    useEffect(() => {
        setPage(1);
        setFavoritesPage(1);
    }, [searchQuery]);

    // Reset pages when tab changes (so stale pages don't carry over)
    useEffect(() => {
        setPage(1);
        setFavoritesPage(1);
    }, [activeTab]);

    const [downloadedNotes, setDownloadedNotes] = useState([]);

    const fetchDownloads = useCallback(async () => {
        const downloads = await getDownloadedNotes();
        setDownloadedNotes(downloads);
    }, []);

    const { refreshing, onRefresh } = useRefresh(async () => {
        if (activeTab === 'Purchases') {
            setPage(1);
            await refetch();
        } else if (activeTab === 'Favorites') {
            setFavoritesPage(1);
            await refetchFavorites();
        } else {
            await fetchDownloads();
        }
    });

    useFocusEffect(
        useCallback(() => {
            fetchDownloads();
            if (activeTab === 'Purchases') refetch();
            if (activeTab === 'Favorites') refetchFavorites();
        }, [refetch, refetchFavorites, fetchDownloads, activeTab])
    );

    useEffect(() => {
        if (isError && activeTab === 'Purchases') {
            showAlert("Error", error?.data?.message || "Failed to load library", "error");
        }
    }, [isError, error, activeTab]);

    const handleLoadMore = () => {
        if (activeTab === 'Purchases' && !isFetching && hasMore) {
            setPage(prev => prev + 1);
        } else if (activeTab === 'Favorites' && !isFavoritesFetching && hasMoreFavorites) {
            setFavoritesPage(prev => prev + 1);
        }
    };

    const handleDeleteDownload = (id) => {
        showAlert(
            "Remove Download",
            "This will only delete the offline copy. You can download it again any time.",
            "warning",
            {
                showCancel: true,
                confirmText: "Remove",
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
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(activeTab === 'Purchases' ? 'NotePreview' : 'StudentNoteDetails', { noteId: item._id || item.id, isLocal: activeTab === 'Downloaded' })}
            >
                <View style={styles.cardCover}>
                    <Image
                        source={item.thumbnail ? { uri: item.thumbnail } : require('../../../assets/topper.avif')}
                        style={styles.coverImage}
                    />
                    {isOffline && (
                        <View style={styles.downloadIndicator}>
                            <Ionicons name="cloud-done" size={16} color="#10B981" />
                        </View>
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <View style={styles.infoTop}>
                        <AppText style={styles.noteSubject} weight="bold">{item.subject?.toUpperCase()}</AppText>
                        <AppText style={styles.noteTitle} weight="medium" numberOfLines={2}>{item.title || item.chapterName}</AppText>
                        <AppText style={styles.authorBadge}>By {item.topperName || 'Verified Topper'}</AppText>
                    </View>

                    <View style={styles.infoBottom}>
                        <View style={styles.actionRow}>
                            <View style={styles.primaryAction}>
                                <Feather name="book-open" size={14} color="white" />
                                <AppText style={styles.actionText} weight="bold">READ</AppText>
                            </View>

                            {activeTab === 'Downloaded' && (
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => handleDeleteDownload(item.id)}
                                >
                                    <Feather name="trash-2" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <AppText style={styles.headerLabel}>STUDENT DASHBOARD</AppText>
                        <AppText style={styles.headerTitle} weight="bold">My Library</AppText>
                    </View>
                    <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate('TransactionHistory')}>
                        <Feather name="clock" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Search in your collection..."
                    containerStyle={styles.searchBar}
                />

                <View style={styles.tabsWrapper}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'Purchases' && styles.activeTabItem]}
                        onPress={() => setActiveTab('Purchases')}
                    >
                        <AppText style={[styles.tabLabel, activeTab === 'Purchases' && styles.activeTabLabel]} weight="bold">PURCHASES</AppText>
                        {activeTab === 'Purchases' && <View style={styles.activeLine} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'Favorites' && styles.activeTabItem]}
                        onPress={() => setActiveTab('Favorites')}
                    >
                        <AppText style={[styles.tabLabel, activeTab === 'Favorites' && styles.activeTabLabel]} weight="bold">FAVORITES</AppText>
                        {activeTab === 'Favorites' && <View style={styles.activeLine} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'Downloaded' && styles.activeTabItem]}
                        onPress={() => setActiveTab('Downloaded')}
                    >
                        <AppText style={[styles.tabLabel, activeTab === 'Downloaded' && styles.activeTabLabel]} weight="bold">OFFLINE</AppText>
                        {activeTab === 'Downloaded' && <View style={styles.activeLine} />}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={
                    activeTab === 'Purchases'
                        ? (purchasedData?.notes || [])
                        : activeTab === 'Favorites'
                            ? (favoritesData?.notes || [])
                            : downloadedNotes
                }
                renderItem={renderNoteCard}
                keyExtractor={(item, index) => `${item._id || item.id}-${index}`}
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={4}
                windowSize={5}
                initialNumToRender={4}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                    />
                }
                ListHeaderComponent={() => (
                    <View style={styles.libraryStats}>
                        <View style={styles.libStatBox}>
                            <AppText style={styles.statVal} weight="bold">
                                {activeTab === 'Purchases'
                                    ? (purchasedData?.pagination?.total || 0)
                                    : activeTab === 'Favorites'
                                        ? (favoritesData?.pagination?.total || 0)
                                        : downloadedNotes.length}
                            </AppText>
                            <AppText style={styles.statLab}>Total Resources</AppText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.libStatBox}>
                            <AppText style={styles.statVal} weight="bold">{downloadedNotes.length}</AppText>
                            <AppText style={styles.statLab}>Offline Books</AppText>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    (isLoading || isFavoritesLoading || (isFetching && page === 1) || (isFavoritesFetching && favoritesPage === 1)) ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                        </View>
                    ) : (
                        <NoDataFound
                            message={activeTab === 'Purchases' ? "No books found in your library." : (activeTab === 'Favorites' ? "No favorite notes yet." : "No offline downloads yet.")}
                            icon={activeTab === 'Purchases' ? 'library-outline' : (activeTab === 'Favorites' ? 'heart-outline' : 'cloud-download-outline')}
                            containerStyle={{ marginTop: 40 }}
                        />
                    )
                }
                ListFooterComponent={
                    (isFetching && page > 1) || (isFavoritesFetching && favoritesPage > 1) ? (
                        <ActivityIndicator size="small" color="#00B1FC" style={{ marginVertical: 20 }} />
                    ) : <View style={{ height: 100 }} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        paddingTop: 60,
        backgroundColor: '#1E293B40',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#33415540',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLabel: {
        fontSize: 10,
        color: '#64748B',
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        color: 'white',
    },
    configBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchBar: {
        marginBottom: 20,
    },
    tabsWrapper: {
        flexDirection: 'row',
        gap: 30,
    },
    tabItem: {
        paddingVertical: 12,
        position: 'relative',
    },
    tabLabel: {
        fontSize: 13,
        color: '#64748B',
        letterSpacing: 0.5,
    },
    activeTabLabel: {
        color: '#00B1FC',
    },
    activeLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#00B1FC',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    libraryStats: {
        flexDirection: 'row',
        backgroundColor: '#1E293B60',
        marginHorizontal: 5,
        borderRadius: 20,
        paddingVertical: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#33415530',
        alignItems: 'center',
    },
    libStatBox: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        color: 'white',
    },
    statLab: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#334155',
    },
    card: {
        flex: 1,
        margin: 5,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 15,
    },
    cardCover: {
        width: '100%',
        height: 160,
        backgroundColor: '#33415540',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    downloadIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    infoTop: {
        marginBottom: 10,
    },
    noteSubject: {
        fontSize: 9,
        color: '#00B1FC',
        letterSpacing: 1,
        marginBottom: 4,
    },
    noteTitle: {
        fontSize: 14,
        color: 'white',
        lineHeight: 18,
        marginBottom: 6,
    },
    authorBadge: {
        fontSize: 11,
        color: '#64748B',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    primaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00B1FC20',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    actionText: {
        fontSize: 10,
        color: '#00B1FC',
    },
    deleteIcon: {
        padding: 5,
    },
    centerBox: {
        marginTop: 60,
        alignItems: 'center',
    }
});

export default MyLibrary;
