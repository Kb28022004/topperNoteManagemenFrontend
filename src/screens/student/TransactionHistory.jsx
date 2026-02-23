import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetTransactionHistoryQuery } from '../../features/api/paymentApi';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import Loader from '../../components/Loader';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { Theme } from '../../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionHistory = ({ navigation }) => {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(''); // '', 'SUCCESS', 'PENDING', 'FAILED'
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch(500);
    const [allTransactions, setAllTransactions] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const {
        data: history,
        isLoading,
        isFetching,
        isSuccess,
        refetch
    } = useGetTransactionHistoryQuery({
        search: searchQuery,
        status: statusFilter,
        page,
        limit: 10
    });

    // Reset list when search or filter changes
    useEffect(() => {
        setPage(1);
        setAllTransactions([]);
        setHasMore(true);
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        if (isSuccess && history) {
            if (page === 1) {
                setAllTransactions(history.transactions);
            } else {
                setAllTransactions(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = history.transactions.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
            setHasMore(history.pagination.page < history.pagination.totalPages);
        }
    }, [isSuccess, history, page]);

    const { refreshing, onRefresh } = useRefresh(async () => {
        setPage(1);
        setHasMore(true);
        await refetch();
    });

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const statusTabs = [
        { label: 'All', value: '' },
        { label: 'Success', value: 'SUCCESS' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' }
    ];

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.transactionCard}
            onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <MaterialCommunityIcons
                        name={item.status === 'SUCCESS' ? 'file-document-check-outline' : 'file-document-remove-outline'}
                        size={24}
                        color={item.status === 'SUCCESS' ? '#10B981' : '#EF4444'}
                    />
                </View>
                <View style={styles.transactionInfo}>
                    <AppText style={styles.noteTitle} weight="bold" numberOfLines={1}>{item.noteTitle}</AppText>
                    <AppText style={styles.transactionDate}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </AppText>
                </View>
                <AppText style={styles.amount} weight="bold">₹{item.amount}</AppText>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.status === 'SUCCESS' ? '#10B981' : '#EF4444' }]} />
                    <AppText style={[styles.statusText, { color: item.status === 'SUCCESS' ? '#10B981' : '#EF4444' }]}>
                        {item.status}
                    </AppText>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MaterialCommunityIcons name="receipt" size={14} color="#3B82F6" />
                        <AppText style={styles.actionText}>Receipt</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <MaterialCommunityIcons name="download" size={14} color="#3B82F6" />
                        <AppText style={styles.actionText}>Invoice</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const HeaderComponent = useMemo(() => (
        <View style={styles.headerComponent}>
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={['#1E293B', '#0F172A']}
                    style={styles.statsCard}
                >
                    <AppText style={styles.statsLabel}>Total Spent in {history?.currentMonthName || 'this month'}</AppText>
                    <View style={styles.amountRow}>
                        <AppText style={styles.totalAmount} weight="bold">₹{history?.totalSpentThisMonth || 0}</AppText>
                        <View style={styles.trendBadge}>
                            <Ionicons name="trending-up" size={12} color="#10B981" />
                            <AppText style={styles.trendText}>12%</AppText>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search transactions..."
                style={styles.searchBar}
            />

            <View style={styles.filterTabs}>
                {statusTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tab, statusFilter === tab.value && styles.activeTab]}
                        onPress={() => setStatusFilter(tab.value)}
                    >
                        <AppText style={[styles.tabText, statusFilter === tab.value && styles.activeTabText]} weight={statusFilter === tab.value ? "bold" : "regular"}>
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            <AppText style={styles.sectionTitle} weight="bold">RECENT TRANSACTIONS</AppText>
        </View>
    ), [history?.currentMonthName, history?.totalSpentThisMonth, localSearch, statusFilter]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Transaction History</AppText>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={allTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={HeaderComponent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
                ListFooterComponent={() => (
                    isFetching && page > 1 ? (
                        <ActivityIndicator size="small" color="#00B1FC" style={{ marginVertical: 20 }} />
                    ) : <View style={{ height: 100 }} />
                )}
                ListEmptyComponent={() => (
                    isFetching ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                            <AppText style={styles.emptyText}>Fetching transactions...</AppText>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="history" size={64} color="#334155" />
                            <AppText style={styles.emptyText}>No transactions found</AppText>
                        </View>
                    )
                )}
            />

            {isLoading && <Loader visible />}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    headerComponent: {
        marginBottom: 10,
    },
    searchBar: {
        marginBottom: 15,
    },
    filterTabs: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeTab: {
        backgroundColor: 'rgba(0, 177, 252, 0.15)',
        borderColor: '#00B1FC',
    },
    tabText: {
        color: '#64748B',
        fontSize: 13,
    },
    activeTabText: {
        color: '#00B1FC',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    statsContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    statsCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statsLabel: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    totalAmount: {
        fontSize: 32,
        color: 'white',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    trendText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: '#64748B',
        fontSize: 12,
        letterSpacing: 1.2,
        marginTop: 15,
        marginBottom: 15,
    },
    transactionCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
        marginLeft: 15,
    },
    noteTitle: {
        color: 'white',
        fontSize: 15,
        marginBottom: 4,
    },
    transactionDate: {
        color: '#64748B',
        fontSize: 12,
    },
    amount: {
        color: 'white',
        fontSize: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: '#3B82F6',
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#64748B',
        marginTop: 15,
        fontSize: 16,
    }
});

export default TransactionHistory;
