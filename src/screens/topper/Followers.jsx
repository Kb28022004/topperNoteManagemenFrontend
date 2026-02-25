import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import { useGetTopperFollowersQuery } from '../../features/api/topperApi';
import useDebounceSearch from '../../hooks/useDebounceSearch';

const Followers = ({ route, navigation }) => {
    const { userId, name } = route.params;
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();

    // States
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [classFilter, setClassFilter] = useState(undefined);
    const [isSortVisible, setIsSortVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Reset pagination on filter changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery, sortBy, classFilter]);

    // API Call
    const queryArgs = useMemo(() => ({
        userId,
        params: {
            search: searchQuery || undefined,
            page,
            limit: 15,
            sortBy,
            class: classFilter
        }
    }), [userId, searchQuery, page, sortBy, classFilter]);

    const { data, isFetching, refetch } = useGetTopperFollowersQuery(queryArgs);

    // Accumulate followers for infinite scroll
    const [allFollowers, setAllFollowers] = useState([]);

    useEffect(() => {
        if (data?.followers) {
            if (page === 1) {
                setAllFollowers(data.followers);
            } else {
                setAllFollowers(prev => [...prev, ...data.followers]);
            }
        }
    }, [data, page]);

    const pagination = data?.pagination || {};

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setPage(1);
        try {
            await refetch().unwrap();
        } catch (err) {
            console.log("Refresh failed:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const handleLoadMore = () => {
        if (page < pagination.totalPages && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const renderFollowerItem = ({ item }) => (
        <TouchableOpacity
            style={styles.followerCard}
            onPress={() => navigation.navigate('StudentProfileDetail', { studentId: item.userId })}
        >
            <Image
                source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <AppText style={styles.name} weight="bold">{item.name}</AppText>
                <AppText style={styles.meta}>
                    Class {item.class || 'N/A'} {item.board ? `• ${item.board}` : ''}
                </AppText>
                {item.joinedAt && (
                    <AppText style={styles.joinedDate}>
                        Joined {new Date(item.joinedAt).toLocaleDateString()}
                    </AppText>
                )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>
    );

    const isFilterActive = sortBy !== 'newest' || !!classFilter;
    const isInitialLoading = isFetching && page === 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <AppText style={styles.headerTitle} weight="bold">Followers</AppText>
                    <AppText style={styles.headerSub}>
                        {pagination.total || 0} students follow {name || 'you'}
                    </AppText>
                </View>
            </View>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Search follower name..."
                    onFilterPress={() => setIsSortVisible(true)}
                    isFilterActive={isFilterActive}
                />
            </View>

            {/* List */}
            <FlatList
                data={allFollowers}
                keyExtractor={(item, index) => `${item.userId}-${index}`}
                renderItem={renderFollowerItem}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                        colors={["#00B1FC"]}
                        backgroundColor="#0F172A"
                    />
                }
                ListFooterComponent={
                    isFetching && page > 1 ? (
                        <ActivityIndicator size="small" color="#00B1FC" style={styles.footerLoader} />
                    ) : null
                }
                ListEmptyComponent={
                    !isInitialLoading ? (
                        <NoDataFound
                            style={{ width: '100%' }}
                            message={searchQuery ? `No results for "${searchQuery}"` : "No followers found yet."}
                            icon="people-outline"
                        />
                    ) : null
                }
            />

            {/* Overlay Loading */}
            {isInitialLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#00B1FC" />
                </View>
            )}

            <SortModal
                visible={isSortVisible}
                onClose={() => setIsSortVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
            // We'll reuse sort modal for sorting. If we need class filtering we can add it here or use another modal.
            // Assuming SortModal has generic sorting options.
            />
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    backBtn: {
        marginRight: 15,
        backgroundColor: '#1E293B',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    headerSub: {
        fontSize: 12,
        color: '#64748B',
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    followerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
        borderWidth: 2,
        borderColor: '#334155',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        color: 'white',
        marginBottom: 2,
    },
    meta: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },
    joinedDate: {
        fontSize: 10,
        color: '#64748B',
    },
    footerLoader: {
        marginVertical: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});

export default Followers;
