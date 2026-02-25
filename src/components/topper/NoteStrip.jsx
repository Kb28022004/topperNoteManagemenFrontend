import React from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../AppText';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    PUBLISHED: { label: 'Approved', bg: 'rgba(16,185,129,0.18)', color: '#10B981' },
    REJECTED: { label: 'Rejected', bg: 'rgba(239,68,68,0.18)', color: '#EF4444' },
    UNDER_REVIEW: { label: 'Pending', bg: 'rgba(245,158,11,0.18)', color: '#F59E0B' },
};
const getStatus = (s) => STATUS_CONFIG[s] ?? STATUS_CONFIG.UNDER_REVIEW;

// ─── Individual card ──────────────────────────────────────────────────────────
const NoteCard = React.memo(({ item }) => {
    const navigation = useNavigation();
    const s = getStatus(item.status);
    // Sales endpoint returns 'totalSales'; My Notes endpoint returns 'salesCount'
    const salesCount = item.totalSales ?? item.salesCount ?? 0;
    const hasSales = salesCount > 0;
    // Sales endpoint uses 'noteId'; My Notes endpoint uses '_id'
    const noteId = item.noteId || item._id;

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TopperNoteDetails', { noteId })}
        >
            {/* Icon + status badge */}
            <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                    <Ionicons name="document-text-outline" size={22} color="#00B1FC" />
                </View>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <AppText style={[styles.badgeText, { color: s.color }]}>{s.label}</AppText>
                </View>
            </View>

            {/* Content */}
            <AppText style={styles.title} numberOfLines={2} weight="bold">
                {item.chapterName || item.subject}
            </AppText>
            <AppText style={styles.sub} numberOfLines={1}>
                {item.subject} • Cl {item.class}
            </AppText>

            {/* Footer — price + sold indicator */}
            <View style={styles.footer}>
                <AppText style={styles.price}>₹{item.price}</AppText>

                {/* Purchased-style sold pill */}
                <View style={[
                    styles.soldPill,
                    { backgroundColor: hasSales ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.12)' }
                ]}>
                    <Ionicons
                        name={hasSales ? 'checkmark-circle' : 'book-outline'}
                        size={13}
                        color={hasSales ? '#10B981' : '#64748B'}
                    />
                    <AppText style={[styles.soldCount, { color: hasSales ? '#10B981' : '#64748B' }]}>
                        {hasSales ? `${salesCount} sold` : 'No sales'}
                    </AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * NoteStrip — horizontal scrolling strip of note cards.
 *
 * Props:
 *  title        {string}   Section heading
 *  notes        {array}    Array of note objects
 *  isLoading    {bool}     Show activity indicator
 *  onSeeAll     {func}     Called when "See all" tapped
 *  emptyMessage {string}   Text shown when notes is empty
 *  accentColor  {string}   Optional colour for "See all" text (default #00B1FC)
 */
const NoteStrip = ({
    title,
    notes = [],
    isLoading = false,
    onSeeAll,
    emptyMessage = 'Nothing here yet.',
    accentColor = '#00B1FC',
}) => (
    <View style={styles.wrapper}>
        {/* Section header */}
        <View style={styles.header}>
            <AppText style={styles.sectionTitle} weight="bold">{title}</AppText>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll}>
                    <AppText style={[styles.seeAll, { color: accentColor }]}>See all</AppText>
                </TouchableOpacity>
            )}
        </View>

        {isLoading ? (
            <ActivityIndicator color="#00B1FC" style={styles.loader} />
        ) : notes.length === 0 ? (
            <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={28} color="#334155" />
                <AppText style={styles.emptyText}>{emptyMessage}</AppText>
            </View>
        ) : (
            <FlatList
                data={notes}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => (item._id || item.noteId)?.toString()}
                renderItem={({ item }) => <NoteCard item={item} />}
                contentContainerStyle={styles.listContent}
            />
        )}
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_WIDTH = 380;

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 28,
        height: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        color: 'white',
    },
    seeAll: {
        fontSize: 13,
    },
    loader: {
        marginVertical: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 12,
    },

    // Empty state
    emptyBox: {
        marginHorizontal: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingVertical: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        gap: 8,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 16,
    },

    // Card
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#334155',
        justifyContent: 'space-between',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#00B1FC12',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    title: {
        color: 'white',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    sub: {
        color: '#64748B',
        fontSize: 11,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        color: '#00B1FC',
        fontSize: 13,
        fontWeight: 'bold',
    },
    salesRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sales: {
        color: '#64748B',
        fontSize: 11,
    },
    // Sold pill
    soldPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    soldCount: {
        fontSize: 11,
        fontWeight: '600',
    },
});

export default NoteStrip;
