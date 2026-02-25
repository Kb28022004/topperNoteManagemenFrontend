import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import SearchBar from '../../components/SearchBar';
import NoDataFound from '../../components/NoDataFound';
import { useGetNoteBuyersQuery } from '../../features/api/noteApi';
import useRefresh from '../../hooks/useRefresh';

const AllNoteBuyers = ({ route, navigation }) => {
    const { noteId } = route.params;
    const [search, setSearch] = useState('');
    const { data: buyers, isLoading, isError, refetch } = useGetNoteBuyersQuery(noteId);
    const { refreshing, onRefresh } = useRefresh(refetch);

    const filteredBuyers = buyers ? buyers.filter(b =>
        b.studentName.toLowerCase().includes(search.toLowerCase()) ||
        b.class?.toLowerCase().includes(search.toLowerCase()) ||
        b.board?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    if (isLoading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#10B981" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>
                <View>
                    <AppText style={styles.headerTitle} weight="bold">Purchased Students</AppText>
                    <AppText style={styles.headerSub}>{buyers?.length || 0} Total Learners</AppText>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search by name or board..."
                    showFilter={false}
                />
            </View>

            {/* List */}
            <FlatList
                data={filteredBuyers}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#10B981"
                    />
                }
                ListEmptyComponent={
                    <NoDataFound
                        message={search ? "No students match your search" : "No purchases yet for this note."}
                        icon="people-outline"
                    />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.buyerCard}
                        onPress={() => navigation.navigate('StudentProfileDetail', { studentId: item.studentId })}
                    >
                        <Image
                            source={item.profilePhoto ? { uri: item.profilePhoto } : require('../../../assets/topper.avif')}
                            style={styles.buyerAvatar}
                        />
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.buyerName} weight="bold">{item.studentName}</AppText>
                            <AppText style={styles.buyerMeta}>Class {item.class} • {item.board}</AppText>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <AppText style={styles.purchasedDate}>
                                {new Date(item.purchasedAt).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </AppText>
                            <View style={styles.statusBadge}>
                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                <AppText style={styles.statusText}>Purchased</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    headerSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    searchWrapper: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    buyerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    buyerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#334155',
    },
    buyerName: {
        color: 'white',
        fontSize: 15,
        marginBottom: 2,
    },
    buyerMeta: {
        color: '#64748B',
        fontSize: 12,
    },
    purchasedDate: {
        color: '#94A3B8',
        fontSize: 11,
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default AllNoteBuyers;
