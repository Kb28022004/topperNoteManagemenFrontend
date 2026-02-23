import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetFollowedToppersQuery } from '../../features/api/studentApi';
import useRefresh from '../../hooks/useRefresh';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import AppText from '../../components/AppText';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import CategoryFilters from '../../components/CategoryFilters';
import NoDataFound from '../../components/NoDataFound';
import { Theme } from '../../theme/Theme';

const { width } = Dimensions.get('window');

const FollowingList = ({ navigation }) => {
    const { searchQuery, localSearch, setLocalSearch } = useDebounceSearch();
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Class 10', 'Class 12', 'Science', 'Commerce', 'Arts'];

    const getQueryParams = () => {
        const params = {};
        if (searchQuery) params.search = searchQuery;

        if (activeFilter === 'Class 10') params.expertiseClass = '10';
        else if (activeFilter === 'Class 12') params.expertiseClass = '12';
        else if (['Science', 'Commerce', 'Arts'].includes(activeFilter)) {
            params.stream = activeFilter;
            params.expertiseClass = '12';
        }

        return params;
    };

    const {
        data: followedToppers,
        isLoading,
        refetch,
        isFetching
    } = useGetFollowedToppersQuery(getQueryParams());

    const { refreshing, onRefresh } = useRefresh(refetch);

    const renderTopperCard = ({ item }) => (
        <TouchableOpacity
            style={styles.topperCard}
            onPress={() => navigation.navigate('PublicTopperProfile', { topperId: item.topperId })}
        >
            <View style={styles.topperLeft}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                        style={styles.avatar}
                    />
                    <View style={styles.statusDot} />
                </View>
                <View style={styles.topperInfo}>
                    <AppText style={styles.topperName} weight="bold">{item.name}</AppText>
                    <AppText style={styles.topperExpertise}>{item.expertise}</AppText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4B5563" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Following</AppText>
                <View style={{ width: 40 }} />
            </View>

            {/* Search & Filters */}
            <View style={styles.searchContainer}>
                <SearchBar
                    placeholder="Search by name or bio..."
                    value={localSearch}
                    onChangeText={setLocalSearch}
                />
            </View>

            {/* <View style={styles.filterWrapper}>
                <CategoryFilters
                    categories={filters}
                    activeCategory={activeFilter}
                    setActiveCategory={setActiveFilter}
                />
            </View> */}

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#00B1FC" />
                </View>
            ) : (
                <FlatList
                    data={followedToppers}
                    renderItem={renderTopperCard}
                    keyExtractor={(item) => item.topperId}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#00B1FC"
                            colors={["#00B1FC"]}
                            backgroundColor="#0F172A"
                        />
                    }
                    ListEmptyComponent={
                        !isFetching && (
                            <NoDataFound
                                message={searchQuery || activeFilter !== 'All'
                                    ? "No toppers found matching your criteria."
                                    : "You haven't followed any toppers yet."}
                                containerStyle={{ marginTop: 60 }}
                            />
                        )
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.layout.screenPadding,
        marginBottom: 10,
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
        fontSize: 20,
        color: 'white',
    },
    searchContainer: {
        paddingHorizontal: Theme.layout.screenPadding,
        marginTop: 10,
    },
    filterWrapper: {
        marginBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: Theme.layout.screenPadding,
        paddingBottom: 30,
        marginTop: 10,
    },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    topperLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    topperInfo: {
        flex: 1,
    },
    topperName: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    topperExpertise: {
        fontSize: 12,
        color: '#94A3B8',
    },
});

export default FollowingList;
