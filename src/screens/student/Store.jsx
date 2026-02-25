import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import { useGetNotesQuery } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';

import useDebounceSearch from '../../hooks/useDebounceSearch';
import useRefresh from '../../hooks/useRefresh';

import AppText from '../../components/AppText';
import NoteCard from '../../components/NoteCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import ScreenLoader from '../../components/ScreenLoader';
import { Theme } from '../../theme/Theme';
import { capitalize } from '../../helpers/capitalize';

const { width } = Dimensions.get('window');

const Store = ({ navigation, route }) => {
    const initialParams = route.params || {};
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch(initialParams.search || '');
    const [activeCategory, setActiveCategory] = useState(initialParams.category || 'All');
    const [selectedSubject, setSelectedSubject] = useState(initialParams.subject || null);
    const [selectedTopper, setSelectedTopper] = useState(initialParams.topperId || null);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState(initialParams.sortBy || 'newest');
    const [timeRange, setTimeRange] = useState(initialParams.timeRange || 'all');
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);

    // Sync with navigation params when they change
    React.useEffect(() => {
        if (route.params) {
            const { search, category, subject, sortBy: pSortBy, timeRange: pTimeRange, topperId } = route.params;
            if (search !== undefined) setLocalSearch(search);
            if (category !== undefined) setActiveCategory(category);
            if (subject !== undefined) setSelectedSubject(subject);
            if (pSortBy !== undefined) setSortBy(pSortBy);
            if (pTimeRange !== undefined) setTimeRange(pTimeRange);
            if (topperId !== undefined) setSelectedTopper(topperId);
        }
    }, [route.params]);

    React.useEffect(() => {
        setPage(1);
    }, [activeCategory, searchQuery, selectedTopper, sortBy, timeRange, selectedSubject]);

    const { data: studentProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetProfileQuery();
    const { data: toppers, isLoading: isLoadingToppers, refetch: refetchToppers } = useGetAllToppersQuery(undefined);

    const {
        data: notesResponse,
        isFetching,
        refetch: refetchNotes,
    } = useGetNotesQuery({
        class: activeCategory === 'Class 12' ? '12' : activeCategory === 'Class 10' ? '10' : undefined,
        board: activeCategory === 'CBSE' ? 'CBSE' : undefined,
        subject: selectedSubject || undefined,
        search: searchQuery || undefined,
        topperId: selectedTopper || undefined,
        sortBy: sortBy,
        timeRange: timeRange,
        page: page
    });

    const handleLoadMore = () => {
        const totalPages = notesResponse?.pagination?.totalPages || 0;
        if (page < totalPages && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchProfile?.(),
                refetchToppers?.(),
                refetchNotes?.()
            ]);
        } catch (error) {
            console.error("Refresh Error:", error);
        }
    };

    const { refreshing, onRefresh } = useRefresh(handleRefresh);

    const categories = ['All', 'Class 12', 'Class 10', 'CBSE'];

    const subjects = useMemo(() => {
        return studentProfile?.subjects?.map((s) => capitalize(s)) || [];
    }, [studentProfile]);

    const renderTopper = ({ item }) => {
        const isSelected = selectedTopper === (item.userId || item.topperId);

        return (
            <TouchableOpacity
                style={[styles.topperItem, isSelected && styles.selectedTopperItem]}
                onPress={() => setSelectedTopper(isSelected ? null : (item.userId || item.topperId))}
            >
                <View style={[styles.avatarContainer, isSelected && styles.selectedAvatarContainer]}>
                    <Image
                        source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                        style={styles.avatar}
                    />
                    {isSelected && (
                        <View style={styles.checkBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#00B1FC" />
                        </View>
                    )}
                </View>
                <AppText style={[styles.topperNameText, isSelected && styles.selectedTopperNameText]} numberOfLines={1}>
                    {item?.name?.split(' ')[0]}
                </AppText>
            </TouchableOpacity>
        );
    };

    const HeaderComponent = useMemo(() => (
        <View style={styles.headerContent}>
            <View style={styles.storeHeader}>
                <View>
                    <View style={styles.liveTag}>
                        <View style={styles.liveCircle} />
                        <AppText style={styles.liveText}>MARKETPLACE</AppText>
                    </View>
                    <AppText style={styles.headerTitle} weight="bold">Academic Store</AppText>
                </View>
                <TouchableOpacity style={styles.cartIconBtn}>
                    <Feather name="shopping-bag" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
                <SearchBar
                    value={localSearch}
                    onChangeText={setLocalSearch}
                    placeholder="Find subjects, topics or toppers..."
                    onFilterPress={() => setIsSortModalVisible(true)}
                    isFilterActive={sortBy !== 'newest' || timeRange !== 'all'}
                />
            </View>

            <CategoryFilters
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                style={styles.categoryFilters}
            />

            <View style={styles.topperFilterSection}>
                <View style={styles.sectionHeadingRow}>
                    <AppText style={styles.sectionTitle} weight="bold">FILTER BY TOPPERS</AppText>
                    {selectedTopper && (
                        <TouchableOpacity onPress={() => setSelectedTopper(null)}>
                            <AppText style={styles.clearText}>Clear</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {isLoadingToppers ? (
                    <ActivityIndicator size="small" color="#00B1FC" style={{ marginVertical: 10 }} />
                ) : (
                    <FlatList
                        horizontal
                        data={toppers?.data || []}
                        keyExtractor={(item) => item.id || item.userId}
                        renderItem={renderTopper}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.toppersFlatList}
                    />
                )}
            </View>

            <View style={styles.resultsHeader}>
                <AppText style={styles.resultsTitle} weight="bold">Available Materials</AppText>
                <AppText style={styles.totalCount}>{notesResponse?.pagination?.totalNotes || 0} items</AppText>
            </View>
        </View>
    ), [localSearch, activeCategory, selectedTopper, toppers, isLoadingToppers, sortBy, timeRange, categories, notesResponse]);

    if (isLoadingProfile) return <ScreenLoader />;

    const renderItem = useCallback(({ item }) => (
        <NoteCard
            note={item}
            onPress={() => navigation.navigate('StudentNoteDetails', { noteId: item._id || item.id })}
        />
    ), [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                ListHeaderComponent={HeaderComponent}
                data={(isFetching && page === 1 && !refreshing) ? [] : (notesResponse?.notes || [])}
                keyExtractor={(item) => item._id || item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.scrollList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={6}
                windowSize={5}
                initialNumToRender={6}
                ListFooterComponent={
                    isFetching ? (
                        <ActivityIndicator size="large" color="#00B1FC" style={{ marginVertical: 40 }} />
                    ) : (notesResponse?.notes?.length === 0) ? (
                        <NoDataFound
                            message="We couldn't find any notes matching your search."
                            containerStyle={{ marginTop: 40 }}
                        />
                    ) : <View style={{ height: 100 }} />
                }
            />

            <SortModal
                visible={isSortModalVisible}
                onClose={() => setIsSortModalVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                subjects={subjects}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    headerContent: {
        paddingTop: 60,
    },
    storeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    liveTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F615',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    liveCircle: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00B1FC',
        marginRight: 6,
    },
    liveText: {
        fontSize: 10,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 28,
        color: 'white',
    },
    cartIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchBox: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    categoryFilters: {
        paddingLeft: 20,
        marginBottom: 25,
    },
    topperFilterSection: {
        marginBottom: 30,
    },
    sectionHeadingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#475569',
        letterSpacing: 1.5,
    },
    clearText: {
        fontSize: 12,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    toppersFlatList: {
        paddingLeft: 20,
        paddingRight: 10,
    },
    topperItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 65,
    },
    avatarContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        borderColor: '#1E293B',
        padding: 2,
        marginBottom: 8,
        position: 'relative',
    },
    selectedAvatarContainer: {
        borderColor: '#00B1FC',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    checkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#0F172A',
        borderRadius: 10,
    },
    topperNameText: {
        fontSize: 11,
        color: '#64748B',
    },
    selectedTopperNameText: {
        color: 'white',
        fontWeight: 'bold',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 18,
        color: 'white',
    },
    totalCount: {
        fontSize: 12,
        color: '#64748B',
    },
    gridRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    scrollList: {
        paddingBottom: 40,
    }
});

export default Store;
