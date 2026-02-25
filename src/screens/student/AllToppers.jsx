import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import ScreenLoader from '../../components/ScreenLoader';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import NoDataFound from '../../components/NoDataFound';
import TopperFilterModal from '../../components/TopperFilterModal';

const { width } = Dimensions.get('window');

const AllToppers = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);

    const {
        data: toppersResponse,
        isLoading,
        isFetching,
        isError,
        refetch
    } = useGetAllToppersQuery({
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
        page,
        class: selectedClass || undefined,
        board: selectedBoard || undefined,
        limit: 15
    });

    const { refreshing, onRefresh: originalRefresh } = useRefresh(refetch);

    const onRefresh = useCallback(() => {
        setPage(1);
        originalRefresh();
    }, [originalRefresh]);

    // Reset page on filter/search changes (RTK merge handles data)
    useEffect(() => {
        setPage(1);
    }, [searchQuery, sortBy, selectedClass, selectedBoard]);

    const handleTopperPress = (userId) => {
        navigation.navigate('PublicTopperProfile', { topperId: userId });
    };

    const loadMore = () => {
        const { page: currentPage, totalPages } = toppersResponse?.pagination || {};
        if (!isFetching && currentPage < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const renderTopperItem = ({ item }) => (
        <TouchableOpacity
            style={styles.topperCard}
            onPress={() => handleTopperPress(item.userId)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <AppText style={styles.name} weight="bold">{item.name}</AppText>
                        <MaterialCommunityIcons name="check-decagram" size={16} color="#00B1FC" />
                    </View>
                    <AppText style={styles.expertise} numberOfLines={1}>Class {item.expertiseClass} • {item.stream || item.board || 'Topper'}</AppText>
                </View>
            </View>

            <AppText style={styles.bio} numberOfLines={2}>{item.bio}</AppText>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.avgRating || '0.0'}</AppText>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="documents-outline" size={14} color="#3B82F6" />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.totalNotes || 0} Notes</AppText>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                    <Ionicons name="people-outline" size={14} color="#10B981" />
                    <AppText style={styles.statValue} weight="bold">{item.stats?.totalSold || 0} Sold</AppText>
                </View>
            </View>

            <View style={styles.footer}>
                <AppText style={styles.viewProfile}>View Profile</AppText>
                <Feather name="arrow-right" size={14} color="#3B82F6" />
            </View>
        </TouchableOpacity>
    );

    if (isLoading && page === 1 && !refreshing) return <ScreenLoader />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Verified Toppers</AppText>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchSection}>
                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Search toppers by name or class..."
                    onFilterPress={() => setIsFilterVisible(true)}
                    isFilterActive={sortBy !== 'newest' || selectedClass !== null || selectedBoard !== null}
                />
            </View>

            <FlatList
                data={allToppers}
                renderItem={renderTopperItem}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isFetching && !isLoading && (
                        isError ? (
                            <NoDataFound message="Something went wrong while fetching toppers." icon="alert-circle-outline" />
                        ) : (
                            <NoDataFound message="No toppers found matching your selection." />
                        )
                    )
                }
                ListFooterComponent={
                    isFetching ? (
                        <View style={{ paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : null
                }
            />

            <TopperFilterModal
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
                selectedBoard={selectedBoard}
                onSelectBoard={setSelectedBoard}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    topperCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#334155',
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    name: {
        fontSize: 16,
        color: 'white',
    },
    expertise: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    bio: {
        fontSize: 13,
        color: '#CBD5E1',
        lineHeight: 18,
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 15,
    },
    stat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 12,
        color: 'white',
    },
    divider: {
        width: 1,
        height: 15,
        backgroundColor: '#334155',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    viewProfile: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: 'bold',
    },
});

export default AllToppers;
