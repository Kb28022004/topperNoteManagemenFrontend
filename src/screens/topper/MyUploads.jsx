import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { useGetMyNotesQuery } from '../../features/api/noteApi';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CATEGORIES = ['All', 'Approved', 'Pending', 'Rejected'];

const CATEGORY_TO_STATUS = {
    All: undefined,
    Approved: 'published',
    Pending: 'under_review',
    Rejected: 'rejected',
};

const STATUS_CONFIG = {
    PUBLISHED: { label: 'Approved', bg: 'rgba(16,185,129,0.18)', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: 'rgba(239,68,68,0.18)', color: '#EF4444' },
    UNDER_REVIEW: { label: 'Pending', bg: 'rgba(245,158,11,0.18)', color: '#F59E0B' },
};
const getStatus = (s) => STATUS_CONFIG[s] ?? STATUS_CONFIG.UNDER_REVIEW;

// ─── Note card ────────────────────────────────────────────────────────────────
const NoteCard = React.memo(({ item }) => {
    const navigation = useNavigation();
    const s = getStatus(item.status);
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TopperNoteDetails', { noteId: item._id })}
        >
            <View style={styles.iconBox}>
                <Ionicons name="document-text-outline" size={22} color="#00B1FC" />
            </View>
            <View style={styles.cardBody}>
                <AppText style={styles.cardTitle} numberOfLines={1} weight="bold">
                    {item.chapterName || item.subject}
                </AppText>
                <AppText style={styles.cardSub} numberOfLines={1}>
                    {item.subject} • Class {item.class} • {item.board}
                </AppText>
                <View style={styles.cardFooter}>
                    <AppText style={styles.price}>₹{item.price}</AppText>
                    <AppText style={styles.sales}>{item.salesCount || 0} Sales</AppText>
                </View>
            </View>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <AppText style={[styles.badgeText, { color: s.color }]}>{s.label}</AppText>
            </View>
        </TouchableOpacity>
    );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MyUploads = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [page, setPage] = useState(1);
    const [isSortVisible, setIsSortVisible] = useState(false);

    // Reset page on any filter change
    useEffect(() => { setPage(1); }, [searchQuery, activeCategory, sortBy, timeRange]);

    const queryArgs = useMemo(() => ({
        search: searchQuery || undefined,
        status: CATEGORY_TO_STATUS[activeCategory],
        sortBy,
        page,
        limit: 10,
    }), [searchQuery, activeCategory, sortBy, page]);

    const { data, isFetching, refetch } = useGetMyNotesQuery(queryArgs);

    const notes = data?.notes ?? [];
    const pagination = data?.pagination ?? {};
    const total = pagination.totalNotes ?? 0;

    // Pull-to-refresh
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try { await refetch().unwrap(); } catch { /* ignore */ }
        finally { setRefreshing(false); }
    }, [refetch]);

    // Infinite scroll
    const handleLoadMore = () => {
        if (page < (pagination.totalPages || 1) && !isFetching) {
            setPage(p => p + 1);
        }
    };

    const isSortActive = sortBy !== 'newest' || timeRange !== 'all';
    // True when a filter/search change triggers a fresh page-1 fetch
    const isFiltering = isFetching && page === 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <AppText style={styles.headerTitle} weight="bold">My Uploads</AppText>
                    <AppText style={styles.headerSub}>{total} note{total !== 1 ? 's' : ''} total</AppText>
                </View>
            </View>

            {/* ── Search + Sort (reusable SearchBar with filter button) ── */}
            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search by subject or chapter..."
                onFilterPress={() => setIsSortVisible(true)}
                isFilterActive={isSortActive}
                style={styles.searchBar}
            />

            {/* ── Status filter chips (reusable CategoryFilters) ── */}
            <CategoryFilters
                categories={STATUS_CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                style={styles.filters}
            />

            {/* ── Notes list ── */}
            <View style={styles.listWrapper}>
                <FlatList
                    data={notes}
                    renderItem={({ item }) => <NoteCard item={item} />}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[
                        styles.listContent,
                        notes.length === 0 && styles.listEmpty,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#00B1FC"
                            colors={['#00B1FC']}
                            backgroundColor="#0F172A"
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        !isFiltering ? (
                            <NoDataFound
                                message={
                                    searchQuery
                                        ? `No notes found for "${searchQuery}"`
                                        : 'No notes uploaded yet. Start sharing your knowledge!'
                                }
                                icon="document-text-outline"
                                containerStyle={{ alignSelf: 'center', marginTop: 40 }}
                            />
                        ) : null
                    }
                    ListFooterComponent={
                        isFetching && page > 1
                            ? <ActivityIndicator color="#00B1FC" style={styles.footerLoader} />
                            : null
                    }
                />

                {/* Overlay spinner while filter/search is fetching */}
                {isFiltering && (
                    <View style={styles.overlay} pointerEvents="none">
                        <View style={styles.overlayInner}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                            <AppText style={styles.overlayText}>Loading...</AppText>
                        </View>
                    </View>
                )}
            </View>

            {/* ── Sort Modal ── */}
            <SortModal
                visible={isSortVisible}
                onClose={() => setIsSortVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
            />
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, gap: 10, backgroundColor: '#0F172A' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    headerTitle: { fontSize: 18, color: 'white', lineHeight: 22 },
    headerSub: { fontSize: 12, color: '#64748B', marginTop: 1 },

    searchBar: { paddingHorizontal: 20, marginTop: 14, marginBottom: 4 },
    filters: { paddingHorizontal: 20 },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    listEmpty: { flex: 1 },
    listWrapper: { flex: 1, position: 'relative' },
    footerLoader: { paddingVertical: 20 },

    // Overlay loader (search / filter transition)
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 12,
    },
    overlayInner: {
        alignItems: 'center',
        gap: 12,
    },
    overlayText: {
        color: '#94A3B8',
        fontSize: 13,
    },

    // Card
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#00B1FC12',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    cardBody: { flex: 1 },
    cardTitle: { color: 'white', fontSize: 14, marginBottom: 3 },
    cardSub: { color: '#94A3B8', fontSize: 12, marginBottom: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    price: { color: '#00B1FC', fontSize: 13, fontWeight: 'bold' },
    sales: { color: '#64748B', fontSize: 12 },

    badge: {
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, marginLeft: 10,
        alignSelf: 'flex-start',
    },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
});

export default MyUploads;
