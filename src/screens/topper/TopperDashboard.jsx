import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { useGetProfileQuery } from '../../features/api/topperApi';
import { useGetMyNotesQuery } from '../../features/api/noteApi';

const { width } = Dimensions.get('window');

const TopperDashboard = ({ navigation }) => {
    const { data: profile, refetch: refetchProfile } = useGetProfileQuery();
    const { data: notes, isLoading, refetch: refetchNotes } = useGetMyNotesQuery();
    const [filter, setFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetchProfile?.().unwrap(), refetchNotes?.().unwrap()]);
        } catch (err) {
            console.log("Refresh Error:", err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchProfile, refetchNotes]);

    const topperStats = profile?.data?.stats;

    const filteredNotes = useMemo(() => {
        if (!notes) return [];
        if (filter === 'All') return notes;
        return notes.filter(n => n.status.toUpperCase() === filter.toUpperCase());
    }, [notes, filter]);

    const renderNoteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.noteItem}
            onPress={() => navigation.navigate('NotePreview', { noteId: item._id })}
        >
            <View style={styles.noteIconBox}>
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#EF4444" />
            </View>
            <View style={styles.noteMainInfo}>
                <AppText style={styles.noteTitle} weight="bold">{item.subject} - {item.chapterName}</AppText>
                <View style={styles.noteMetaRow}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                        <AppText style={[styles.statusText, { color: item.status === 'PUBLISHED' ? '#10B981' : '#F59E0B' }]}>
                            {item.status === 'PUBLISHED' ? 'Approved' : 'Pending'}
                        </AppText>
                    </View>
                    <AppText style={styles.dot}>•</AppText>
                    <AppText style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</AppText>
                </View>
            </View>
            <View style={styles.notePriceInfo}>
                <AppText style={styles.notePrice} weight="bold">₹{item.price}</AppText>
                <View style={styles.salesRow}>
                    <MaterialCommunityIcons name="shopping-outline" size={12} color="#94A3B8" />
                    <AppText style={styles.salesCount}>{item.salesCount || 0} sold</AppText>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Dashboard</AppText>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00B1FC"
                        colors={["#00B1FC"]}
                        backgroundColor="#0F172A"
                    />
                }
            >
                {/* Earnings Card */}
                <View style={styles.earningsCard}>
                    <AppText style={styles.labelSmall}>Total Sales</AppText>
                    <View style={styles.mainEarningsRow}>
                        <AppText style={styles.mainEarnings} weight="bold">₹{topperStats?.totalEarnings || 0}</AppText>
                        <View style={styles.trendRow}>
                            <AppText style={styles.trendText}>+12%</AppText>
                        </View>
                    </View>

                    <View style={styles.subStatsRow}>
                        <View style={styles.subStatBox}>
                            <AppText style={styles.labelExtraSmall}>THIS MONTH</AppText>
                            <AppText style={styles.subStatValue} weight="bold">₹{topperStats?.thisMonthEarnings || 0}</AppText>
                        </View>
                        <View style={styles.subStatBox}>
                            <AppText style={styles.labelExtraSmall}>PENDING</AppText>
                            <AppText style={styles.subStatValue} weight="bold">₹{topperStats?.pendingEarnings || 0}</AppText>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.withdrawBtn}>
                        <MaterialCommunityIcons name="wallet-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <AppText style={styles.withdrawText} weight="bold">Withdraw Funds</AppText>
                    </TouchableOpacity>
                </View>

                {/* My Uploaded Notes Section */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle} weight="bold">My Uploaded Notes</AppText>
                    <TouchableOpacity>
                        <Feather name="sliders" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    {['All', 'Published', 'Pending'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                            onPress={() => setFilter(f)}
                        >
                            {f === 'Published' && <Ionicons name="checkmark-circle" size={14} color={filter === f ? 'white' : '#10B981'} style={{ marginRight: 4 }} />}
                            {f === 'Pending' && <Ionicons name="time" size={14} color={filter === f ? 'white' : '#F59E0B'} style={{ marginRight: 4 }} />}
                            <AppText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === 'Published' ? 'Approved' : f}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {isLoading ? (
                    <ActivityIndicator color="#00B1FC" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredNotes}
                        renderItem={renderNoteItem}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        contentContainerStyle={{ gap: 12 }}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <AppText style={styles.emptyText}>No notes found</AppText>
                            </View>
                        }
                    />
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('UploadNotes')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
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
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    earningsCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 30,
    },
    labelSmall: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 8,
    },
    mainEarningsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    mainEarnings: {
        fontSize: 36,
        color: 'white',
    },
    trendRow: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    trendText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    subStatsRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 15,
    },
    subStatBox: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    labelExtraSmall: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 4,
    },
    subStatValue: {
        fontSize: 18,
        color: 'white',
    },
    withdrawBtn: {
        backgroundColor: '#00B1FC',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    withdrawText: {
        color: 'white',
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        color: 'white',
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    filterBtnActive: {
        backgroundColor: '#334155',
        borderColor: '#00B1FC',
    },
    filterText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    filterTextActive: {
        color: 'white',
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    noteIconBox: {
        width: 44,
        height: 44,
        backgroundColor: '#0F172A',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    noteMainInfo: {
        flex: 1,
    },
    noteTitle: {
        fontSize: 15,
        color: 'white',
        marginBottom: 4,
    },
    noteMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dot: {
        color: '#475569',
        marginHorizontal: 8,
    },
    metaText: {
        fontSize: 12,
        color: '#64748B',
    },
    notePriceInfo: {
        alignItems: 'flex-end',
    },
    notePrice: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    salesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    salesCount: {
        fontSize: 11,
        color: '#94A3B8',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00B1FC',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#64748B',
    }
});

export default TopperDashboard;
