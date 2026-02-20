import React, { useState } from 'react';
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

import { Ionicons } from '@expo/vector-icons';
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
import { Theme } from '../../theme/Theme';
import { capitalize } from '../../helpers/capitalize';

const { width } = Dimensions.get('window');

const Store = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedTopper, setSelectedTopper] = useState(null);
    const [page, setPage] = useState(1);

    // Reset page to 1 on filter/search change
    React.useEffect(() => {
        setPage(1);
    }, [activeCategory, searchQuery, selectedTopper]);

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
            // 1. Refetch profile first
            await refetchProfile?.();

            // 2. Only refetch dependent queries if they were not skipped
            const promises = [];
            promises.push(refetchToppers?.());
            promises.push(refetchNotes?.());

            if (promises.length > 0) {
                await Promise.all(promises);
            }
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

    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText style={styles.headerSubtitle}>Store</AppText>
                    <AppText style={styles.headerTitle} weight="bold">
                        Browse Notes
                    </AppText>
                </View>
                <TouchableOpacity style={styles.cartButton}>
                    <Ionicons name="cart" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <SearchBar
                value={localSearch}
                onChangeText={setLocalSearch}
                placeholder="Search by subject, topper, or class"
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
                {toppers?.data?.length > 0 && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AllToppers')}
                    >
                        <AppText style={styles.viewAllText}>View all</AppText>
                    </TouchableOpacity>
                )}
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
                <TouchableOpacity
                    onPress={() => navigation.navigate('AllNotes')}
                >
                    {/* <AppText style={styles.viewAllText}>View all</AppText> */}
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoadingProfile) return <Loader visible />;

    const renderFooter = () => {
        if (!isFetching || page === 1) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#00B1FC" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Notes Grid with All contents in Header */}
            <FlatList
                ListHeaderComponent={renderHeader}
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
                    !isFetching && (
                        <NoDataFound
                            message="No notes found in this category."
                            containerStyle={{ marginTop: 40, marginHorizontal: 20 }}
                        />
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />

            {/* 🔥 Overlay Loader (Search / Filter / Refetch) */}
            {isFetching && (
                <View style={styles.overlayLoader}>
                    <ActivityIndicator size="large" color="#00B1FC" />
                </View>
            )}
        </View>
    );
};

export default Store;

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
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 20,
    },
    headerSubtitle: {
        color: '#94A3B8',
        fontSize: 14,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
    },
    cartButton: {
        width: 45,
        height: 45,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
        marginVertical: 15,
    },
    sectionTitle: {
        color: '#94A3B8',
        fontSize: 12,
        letterSpacing: 1,
    },
    viewAllText: {
        color: '#3B82F6',
        fontSize: 12,
    },
    toppersList: {
        paddingHorizontal: Theme.layout.screenPadding,
        paddingBottom: 10,
    },
    topperItem: {
        alignItems: 'center',
        width: 70,
        marginRight: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    selectedAvatarContainer: {
        borderColor: '#00B1FC',
        transform: [{ scale: 1.05 }],
    },
    checkBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#0F172A',
        borderRadius: 10,
    },
    selectedTopperName: {
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    topperName: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
    },
    center: {
        alignItems: 'center',
        marginTop: 50,
    },
    overlayLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,23,42,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    notesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
        marginVertical: 15,
    },
    notesSectionTitle: {
        color: '#f9f9f9ff',
        fontSize: 18,
        letterSpacing: 1,
    },
    notesSectionViewAllText: {
        color: '#3B82F6',
        fontSize: 12,
    },
    emptyToppersContainer: {
        paddingHorizontal: Theme.layout.screenPadding,
        paddingVertical: 10,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        marginHorizontal: Theme.layout.screenPadding,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 10,
    },
    emptyToppersText: {
        color: '#94A3B8',
        fontSize: 13,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
