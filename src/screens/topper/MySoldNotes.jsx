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
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { useGetMySalesDetailsQuery } from '../../features/api/noteApi';

// ─── Note card ────────────────────────────────────────────────────────────────
const SoldNoteCard = React.memo(({ item }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TopperNoteDetails', { noteId: item.noteId })}
        >
            <View style={styles.iconBox}>
                <Ionicons name="cart-outline" size={22} color="#10B981" />
            </View>
            <View style={styles.cardBody}>
                <AppText style={styles.cardTitle} numberOfLines={1} weight="bold">
                    {item.chapterName || item.subject}
                </AppText>
                <AppText style={styles.cardSub} numberOfLines={1}>
                    {item.subject} • Class {item.class}
                </AppText>
                <View style={styles.cardFooter}>
                    <View style={styles.footerStat}>
                        <Ionicons name="people-outline" size={14} color="#64748B" />
                        <AppText style={styles.statText}>{item.totalSales || 0} Buyers</AppText>
                    </View>
                    <View style={styles.footerStat}>
                        <Ionicons name="wallet-outline" size={14} color="#10B981" />
                        <AppText style={[styles.statText, { color: '#10B981', fontWeight: 'bold' }]}>
                            ₹{item.revenue || 0}
                        </AppText>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#334155" />
        </TouchableOpacity>
    );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MySoldNotes = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [page, setPage] = useState(1);
    const [isSortVisible, setIsSortVisible] = useState(false);

    // Reset page on any filter change
    useEffect(() => { setPage(1); }, [searchQuery, sortBy, timeRange]);

    const queryArgs = useMemo(() => ({
        search: searchQuery || undefined,
        sortBy,
        timeRange: timeRange || undefined,
        page,
        limit: 10,
    }), [searchQuery, sortBy, timeRange, page]);

    const { data, isFetching, refetch } = useGetMySalesDetailsQuery(queryArgs);

    const notes = data?.notes ?? [];
    const pagination = data?.pagination ?? {};
    const summary = data?.summary ?? {};

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

    const isSortActive = sortBy !== 'newest';
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
                    <AppText style={styles.headerTitle} weight="bold">My Sold Notes</AppText>
                    <AppText style={styles.headerSub}>
                        ₹{summary.totalRevenue || 0} Total Revenue • {summary.totalSales || 0} Sales
                    </AppText>
                </View>
            </View>

            {/* ── Search + Sort ── */}
            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search sold notes..."
                onFilterPress={() => setIsSortVisible(true)}
                isFilterActive={isSortActive}
                style={styles.searchBar}
            />

            {/* ── Notes list ── */}
            <View style={styles.listWrapper}>
                <FlatList
                    data={notes}
                    renderItem={({ item }) => <SoldNoteCard item={item} />}
                    keyExtractor={(item) => item.noteId}
                    contentContainerStyle={[
                        styles.listContent,
                        notes.length === 0 && styles.listEmpty,
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#10B981"
                            colors={['#10B981']}
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
                                        ? `No sold notes found for "${searchQuery}"`
                                        : "No notes sold yet. They'll appear here once purchased!"
                                }
                                icon="cart-outline"
                                containerStyle={{ alignSelf: 'center', marginTop: 40 }}
                            />
                        ) : null
                    }
                    ListFooterComponent={
                        isFetching && page > 1
                            ? <ActivityIndicator color="#10B981" style={styles.footerLoader} />
                            : null
                    }
                />

                {/* Overlay spinner */}
                {isFiltering && (
                    <View style={styles.overlay} pointerEvents="none">
                        <View style={styles.overlayInner}>
                            <ActivityIndicator size="large" color="#10B981" />
                            <AppText style={styles.overlayText}>Updating...</AppText>
                        </View>
                    </View>
                )}
            </View>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    headerTitle: { fontSize: 18, color: 'white' },
    headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

    searchBar: { paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    listEmpty: { flex: 1 },
    listWrapper: { flex: 1, position: 'relative' },
    footerLoader: { paddingVertical: 20 },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 10,
    },
    overlayInner: { alignItems: 'center', gap: 12 },
    overlayText: { color: '#94A3B8', fontSize: 13 },

    // Card
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconBox: {
        width: 46, height: 46, borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    cardBody: { flex: 1 },
    cardTitle: { color: 'white', fontSize: 15, marginBottom: 4 },
    cardSub: { color: '#64748B', fontSize: 12, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', gap: 16 },
    footerStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { color: '#94A3B8', fontSize: 12 },
});

export default MySoldNotes;
