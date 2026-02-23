import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetAllToppersQuery } from '../../features/api/topperApi';
import { useGetNotesQuery } from '../../features/api/noteApi';
import { useGetProfileQuery } from '../../features/api/studentApi';

import useDebounceSearch from '../../hooks/useDebounceSearch';
import useRefresh from '../../hooks/useRefresh';

import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import NoteCard from '../../components/NoteCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import SortModal from '../../components/SortModal';
import { Theme } from '../../theme/Theme';
import { capitalize } from '../../helpers/capitalize';

const { width } = Dimensions.get('window');

const Store = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedTopper, setSelectedTopper] = useState(null);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest');
    const [timeRange, setTimeRange] = useState('all');
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);

    // Reset page to 1 on filter/search change
    React.useEffect(() => {
        setPage(1);
    }, [activeCategory, searchQuery, selectedTopper, sortBy, timeRange]);

    // Profile
    const { data: studentProfile, isLoading: isLoadingProfile, refetch: refetchProfile } =
        useGetProfileQuery();

    // Toppers
    const { data: toppers, isLoading: isLoadingToppers, refetch: refetchToppers } =
        useGetAllToppersQuery(undefined);

    const {
        data: notesResponse,
        isFetching,
        refetch: refetchNotes,
    } = useGetNotesQuery(
        {
            subject: activeCategory === 'All' ? undefined : activeCategory,
            search: searchQuery || undefined,
            topperId: selectedTopper || undefined,
            sortBy: sortBy,
            timeRange: timeRange,
            page: page
        }
    );

    const handleLoadMore = () => {
        const totalPages = notesResponse?.pagination?.totalPages || 0;
        if (page < totalPages && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const handleRefresh = async () => {
        try {
            await refetchProfile?.();
            const promises = [];
            promises.push(refetchToppers?.());
            promises.push(refetchNotes?.());
            if (promises.length > 0) await Promise.all(promises);
        } catch (error) {
            console.error("Refresh Error:", error);
        }
    };

    const { refreshing, onRefresh } = useRefresh(handleRefresh);

    const categories = [
        'All',
        ...(studentProfile?.subjects?.map((s) => capitalize(s)) || []),
    ];

    const renderTopper = ({ item }) => {
        const isSelected = selectedTopper === (item.userId || item.topperId);

        return (
            <TouchableOpacity
                style={[styles.topperItem, isSelected && styles.selectedTopperItem]}
                onPress={() => setSelectedTopper(isSelected ? null : (item.userId || item.topperId))}
            >
                <View style={[styles.avatarContainer, isSelected && styles.selectedAvatarContainer]}>
                    <Image
                        source={
                            item.profilePhoto
                                ? { uri: item.profilePhoto }
                                : require('../../../assets/topper.avif')
                        }
                        style={styles.avatar}
                    />
                    {isSelected && (
                        <View style={styles.checkBadge}>
                            <Ionicons name="checkmark-circle" size={18} color="#00B1FC" />
                        </View>
                    )}
                </View>
                <AppText style={[styles.topperName, isSelected && styles.selectedTopperName]} numberOfLines={1}>
                    {item?.name?.split(' ')[0]}
                </AppText>
            </TouchableOpacity>
        );
    };

    const HeaderComponent = useMemo(() => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText style={styles.headerSubtitle}>Store</AppText>
                    <AppText style={styles.headerTitle} weight="bold">
                        Browse Notes
                    </AppText>
                </View>
            </View>

            {/* Search */}
            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search by subject, topper, or class"
                onFilterPress={() => setIsSortModalVisible(true)}
                isFilterActive={sortBy !== 'newest' || timeRange !== 'all'}
                style={{ paddingHorizontal: 20 }}
            />

            {/* Categories */}
            <CategoryFilters
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                style={{ paddingHorizontal: 20, marginBottom: 10 }}
            />

            {/* Toppers Section */}
            <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle} weight="bold">
                    FILTER BY TOPPERS
                </AppText>
            </View>

            <View style={{ marginBottom: 20 }}>
                {isLoadingToppers ? (
                    <ActivityIndicator size="small" color="#00B1FC" />
                ) : toppers?.data?.length > 0 ? (
                    <FlatList
                        horizontal
                        data={toppers?.data || []}
                        keyExtractor={(item) => item.id || item.userId}
                        renderItem={renderTopper}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.toppersList}
                    />
                ) : (
                    <NoDataFound
                        message="No toppers found at the moment."
                        containerStyle={{ marginHorizontal: Theme.layout.screenPadding, paddingVertical: 20 }}
                    />
                )}
            </View>

            {/* Notes Section Header */}
            <View style={styles.notesSectionHeader}>
                <AppText style={styles.notesSectionTitle} weight="bold">
                    All Available Notes
                </AppText>
            </View>
        </View>
    ), [localSearch, activeCategory, selectedTopper, toppers, isLoadingToppers, sortBy, timeRange, navigation, categories]);

    if (isLoadingProfile) return <Loader visible />;

    return (
        <View style={styles.container}>
            {/* Notes Grid with All contents in Header */}
            <FlatList
                ListHeaderComponent={HeaderComponent}
                data={notesResponse?.notes || []}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => (
                    <NoteCard
                        note={item}
                        onPress={() =>
                            navigation.navigate('StudentNoteDetails', {
                                noteId: item._id || item.id,
                            })
                        }
                    />
                )}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListEmptyComponent={
                    isFetching ? (
                        <View style={{ marginTop: 60, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#00B1FC" />
                            <AppText style={{ color: '#94A3B8', marginTop: 15 }}>Searching for notes...</AppText>
                        </View>
                    ) : (
                        <NoDataFound
                            message="No notes found in this category."
                            containerStyle={{ marginTop: 40, marginHorizontal: 20 }}
                        />
                    )
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B1FC" />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            <SortModal
                visible={isSortModalVisible}
                onClose={() => setIsSortModalVisible(false)}
                selectedSort={sortBy}
                onSelectSort={setSortBy}
                selectedTime={timeRange}
                onSelectTime={setTimeRange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 28,
        color: 'white',
        marginTop: 4,
    },
    toppersList: {
        paddingHorizontal: 20,
        gap: 15,
    },
    topperItem: {
        alignItems: 'center',
        width: 70,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
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
        borderRadius: 30,
    },
    checkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#0F172A',
        borderRadius: 10,
    },
    topperName: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
    },
    selectedTopperName: {
        color: 'white',
        fontWeight: 'bold',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#64748B',
        letterSpacing: 1,
        marginTop:20
    },
    notesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.layout.screenPadding,
        marginVertical: 15,
    },
    notesSectionTitle: {
        color: '#f9f9f9ff',
        fontSize: 18,
        letterSpacing: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
    },
});

export default Store;
