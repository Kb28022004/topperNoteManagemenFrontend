import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import NoDataFound from '../../components/NoDataFound';
import { useGetTopperReviewsQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { Theme } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const TopperReviews = ({ route, navigation }) => {
    const { topperId } = route.params;
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch('', 500);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [ratingFilter, setRatingFilter] = useState(null);

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        refetch
    } = useGetTopperReviewsQuery({
        topperId,
        page,
        search: searchQuery,
        sortBy,
        rating: ratingFilter
    });

    const { refreshing, onRefresh } = useRefresh(async () => {
        setPage(1);
        await refetch();
    });

    const handleLoadMore = () => {
        if (!isFetching && response?.page < response?.totalPages) {
            setPage(prev => prev + 1);
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, sortBy, ratingFilter]);

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image
                    source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                    style={styles.studentAvatar}
                />
                <View style={styles.headerInfo}>
                    <AppText style={styles.studentName} weight="bold">{item.user}</AppText>
                    <View style={styles.metaRow}>
                        <AppText style={styles.timeAgo}>{item.daysAgo}</AppText>
                        {item.verifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-seal" size={12} color="#10B981" />
                                <AppText style={styles.verifiedText}>Verified Purchase</AppText>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.ratingTag, { backgroundColor: item.rating >= 4 ? '#10B98115' : '#F59E0B15' }]}>
                    <Ionicons name="star" size={12} color={item.rating >= 4 ? '#10B981' : '#F59E0B'} />
                    <AppText style={[styles.ratingVal, { color: item.rating >= 4 ? '#10B981' : '#F59E0B' }]} weight="bold">{item.rating}</AppText>
                </View>
            </View>

            <AppText style={styles.commentText}>{item.comment || "No comment provided."}</AppText>

            {item.noteInfo && (
                <View style={styles.noteRefBox}>
                    <Feather name="book-open" size={12} color="#94A3B8" />
                    <AppText style={styles.noteRefText} numberOfLines={1}>
                        Reviewed on: <AppText weight="bold" style={{ color: '#00B1FC' }}>{item.noteInfo.subject}</AppText> - {item.noteInfo.chapter}
                    </AppText>
                </View>
            )}
        </View>
    );

    const FilterChip = ({ label, active, onPress }) => (
        <TouchableOpacity
            style={[styles.chip, active && styles.activeChip]}
            onPress={onPress}
        >
            <AppText style={[styles.chipText, active && styles.activeChipText]} weight={active ? "bold" : "regular"}>
                {label}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            {/* Premium Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <AppText style={styles.title} weight="bold">All Reviews</AppText>
                        <AppText style={styles.subtitle}>{response?.total || 0} Feedbacks Received</AppText>
                    </View>
                    <TouchableOpacity style={styles.infoIcon}>
                        <Feather name="help-circle" size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Feather name="search" size={18} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search in comments..."
                            placeholderTextColor="#64748B"
                            value={localSearch}
                            onChangeText={setLocalSearch}
                        />
                        {localSearch.length > 0 && (
                            <TouchableOpacity onPress={() => setLocalSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterScroll}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={[
                            { label: 'All', value: null },
                            { label: '5 ★', value: 5 },
                            { label: '4 ★', value: 4 },
                            { label: '3 ★', value: 3 },
                            { label: '< 3 ★', value: 2 },
                        ]}
                        renderItem={({ item }) => (
                            <FilterChip
                                label={item.label}
                                active={ratingFilter === item.value}
                                onPress={() => setRatingFilter(item.value)}
                            />
                        )}
                        keyExtractor={item => item.label}
                        contentContainerStyle={styles.chipList}
                    />
                </View>

                {/* Sort Toggle */}
                <View style={styles.sortRow}>
                    <AppText style={styles.sortLabel}>Sorting by:</AppText>
                    <TouchableOpacity
                        style={styles.sortToggle}
                        onPress={() => setSortBy(sortBy === 'newest' ? 'rating_high' : sortBy === 'rating_high' ? 'rating_low' : 'newest')}
                    >
                        <MaterialCommunityIcons name="sort-variant" size={16} color="#00B1FC" />
                        <AppText style={styles.sortVal} weight="bold">
                            {sortBy === 'newest' ? 'Newest First' : sortBy === 'rating_high' ? 'Highest Rating' : 'Lowest Rating'}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Reviews List */}
            <FlatList
                data={response?.reviews || []}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderReviewItem}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
                ListFooterComponent={
                    isFetching ? (
                        <ActivityIndicator size="small" color="#00B1FC" style={{ marginVertical: 20 }} />
                    ) : (response?.reviews?.length > 0 && page >= response?.totalPages) ? (
                        <AppText style={styles.endText}>You've reached the end of your reviews.</AppText>
                    ) : null
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.loaderBox}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                            <AppText style={{ color: '#64748B', marginTop: 15 }}>Loading your feedback...</AppText>
                        </View>
                    ) : (
                        <NoDataFound
                            message={searchQuery ? "No reviews match your search." : "No reviews found for your profile yet."}
                            icon="star-half-outline"
                        />
                    )
                }
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
        backgroundColor: '#1E293B40',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#33415550',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 20,
        color: 'white',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    infoIcon: {
        padding: 5,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        marginLeft: 10,
    },
    filterScroll: {
        marginBottom: 15,
    },
    chipList: {
        paddingLeft: 20,
        paddingRight: 10,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeChip: {
        backgroundColor: '#00B1FC20',
        borderColor: '#00B1FC',
    },
    chipText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    activeChipText: {
        color: '#00B1FC',
    },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        gap: 8,
    },
    sortLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    sortToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#00B1FC10',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    sortVal: {
        fontSize: 12,
        color: '#00B1FC',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#33415580',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    studentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#334155',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    studentName: {
        fontSize: 16,
        color: 'white',
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timeAgo: {
        fontSize: 12,
        color: '#64748B',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: 'bold',
    },
    ratingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingVal: {
        fontSize: 14,
    },
    commentText: {
        fontSize: 14,
        color: '#CBD5E1',
        lineHeight: 22,
        marginBottom: 15,
    },
    noteRefBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#0F172A40',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#33415540',
    },
    noteRefText: {
        fontSize: 11,
        color: '#94A3B8',
        flex: 1,
    },
    loaderBox: {
        marginTop: 60,
        alignItems: 'center',
    },
    endText: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 10,
    }
});

export default TopperReviews;
