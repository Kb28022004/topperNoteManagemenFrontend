import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Base Skeleton block with shimmer animation
// ─────────────────────────────────────────────
export const Skeleton = memo(({ width: w = '100%', height = 16, borderRadius = 8, style }) => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

    return (
        <Animated.View
            style={[
                {
                    width: w,
                    height,
                    borderRadius,
                    backgroundColor: '#334155',
                    opacity,
                },
                style,
            ]}
        />
    );
});

// ─────────────────────────────────────────────
// Skeleton for a single NoteCard (grid item)
// ─────────────────────────────────────────────
export const NoteCardSkeleton = memo(() => (
    <View style={cardSkeletonStyles.card}>
        <Skeleton height={130} borderRadius={0} />
        <View style={cardSkeletonStyles.body}>
            <Skeleton width={50} height={10} borderRadius={4} />
            <Skeleton height={12} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
            <View style={cardSkeletonStyles.row}>
                <Skeleton width={40} height={18} borderRadius={6} />
                <Skeleton width={26} height={26} borderRadius={13} />
            </View>
        </View>
    </View>
));

const cardSkeletonStyles = StyleSheet.create({
    card: {
        width: (width - 40) / 2 - 10,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#33415550',
    },
    body: { padding: 12, gap: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
});

// ─────────────────────────────────────────────
// Grid of NoteCard skeletons (for Store/Home)
// ─────────────────────────────────────────────
export const NoteCardGridSkeleton = memo(({ count = 6 }) => (
    <View style={gridStyles.grid}>
        {Array.from({ length: count }).map((_, i) => (
            <NoteCardSkeleton key={i} />
        ))}
    </View>
));

const gridStyles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        paddingTop: 16,
    },
});

// ─────────────────────────────────────────────
// Skeleton for Note Details screen
// ─────────────────────────────────────────────
export const NoteDetailsSkeleton = memo(() => (
    <View style={detailStyles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header bar */}
        <View style={detailStyles.header}>
            <Skeleton width={36} height={36} borderRadius={18} />
            <Skeleton width={120} height={16} borderRadius={8} />
            <View style={detailStyles.headerRight}>
                <Skeleton width={36} height={36} borderRadius={18} />
                <Skeleton width={36} height={36} borderRadius={18} />
            </View>
        </View>

        {/* Hero image */}
        <Skeleton height={260} borderRadius={0} />

        {/* Content body */}
        <View style={detailStyles.body}>
            {/* Title */}
            <Skeleton height={22} borderRadius={8} style={{ marginBottom: 6 }} />
            <Skeleton width="65%" height={22} borderRadius={8} style={{ marginBottom: 16 }} />

            {/* Rating row */}
            <View style={detailStyles.row}>
                <Skeleton width={80} height={14} borderRadius={6} />
                <Skeleton width={60} height={14} borderRadius={6} />
            </View>

            {/* Divider */}
            <View style={detailStyles.divider} />

            {/* Topper card */}
            <View style={detailStyles.topperCard}>
                <Skeleton width={52} height={52} borderRadius={26} />
                <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="60%" height={14} borderRadius={6} />
                    <Skeleton width="40%" height={12} borderRadius={6} />
                </View>
                <Skeleton width={70} height={30} borderRadius={15} />
            </View>

            {/* Stats row */}
            <View style={detailStyles.statsRow}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={detailStyles.statBox}>
                        <Skeleton width={36} height={36} borderRadius={18} />
                        <Skeleton width={40} height={14} borderRadius={6} style={{ marginTop: 6 }} />
                        <Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 4 }} />
                    </View>
                ))}
            </View>

            {/* Description */}
            <Skeleton width={100} height={16} borderRadius={6} style={{ marginBottom: 10 }} />
            {[0, 1, 2].map(i => (
                <Skeleton key={i} width={i === 2 ? '70%' : '100%'} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            ))}

            {/* Reviews header */}
            <View style={[detailStyles.row, { marginTop: 20 }]}>
                <Skeleton width={140} height={16} borderRadius={6} />
                <Skeleton width={80} height={14} borderRadius={6} />
            </View>

            {/* Review cards */}
            {[0, 1].map(i => (
                <View key={i} style={detailStyles.reviewCard}>
                    <View style={detailStyles.row}>
                        <Skeleton width={36} height={36} borderRadius={18} />
                        <View style={{ flex: 1, gap: 6 }}>
                            <Skeleton width="40%" height={12} borderRadius={4} />
                            <Skeleton width="25%" height={10} borderRadius={4} />
                        </View>
                    </View>
                    <Skeleton height={12} borderRadius={4} style={{ marginTop: 8 }} />
                    <Skeleton width="80%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
            ))}
        </View>
    </View>
));

const detailStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 55,
        paddingBottom: 14,
        backgroundColor: '#0F172A',
    },
    headerRight: { flexDirection: 'row', gap: 10 },
    body: { padding: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 18 },
    topperCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
    statBox: { alignItems: 'center' },
    reviewCard: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
    },
});

// ─────────────────────────────────────────────
// Generic horizontal list item skeleton
// (for Library, Orders, etc.)
// ─────────────────────────────────────────────
export const ListItemSkeleton = memo(({ count = 5 }) => (
    <View style={listStyles.wrapper}>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={listStyles.item}>
                <Skeleton width={80} height={90} borderRadius={12} />
                <View style={listStyles.info}>
                    <Skeleton width={50} height={10} borderRadius={4} />
                    <Skeleton height={13} borderRadius={6} style={{ marginTop: 8 }} />
                    <Skeleton width="60%" height={13} borderRadius={6} style={{ marginTop: 4 }} />
                    <Skeleton width={80} height={10} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
            </View>
        ))}
    </View>
));

const listStyles = StyleSheet.create({
    wrapper: { paddingHorizontal: 20, paddingTop: 16 },
    item: {
        flexDirection: 'row',
        gap: 14,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#33415530',
    },
    info: { flex: 1, gap: 2 },
});

// ─────────────────────────────────────────────
// Profile page skeleton
// ─────────────────────────────────────────────
export const ProfileSkeleton = memo(() => (
    <View style={profileStyles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header banner */}
        <Skeleton height={200} borderRadius={0} />

        {/* Avatar + name */}
        <View style={profileStyles.avatarSection}>
            <Skeleton width={90} height={90} borderRadius={45} style={{ marginTop: -45 }} />
            <Skeleton width={140} height={18} borderRadius={8} style={{ marginTop: 12 }} />
            <Skeleton width={90} height={12} borderRadius={6} style={{ marginTop: 6 }} />
        </View>

        {/* Stats row */}
        <View style={profileStyles.statsRow}>
            {[0, 1, 2].map(i => (
                <View key={i} style={profileStyles.statBox}>
                    <Skeleton width={40} height={20} borderRadius={6} />
                    <Skeleton width={55} height={10} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
            ))}
        </View>

        {/* Menu items */}
        <View style={profileStyles.menuSection}>
            {[0, 1, 2, 3, 4].map(i => (
                <View key={i} style={profileStyles.menuItem}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <Skeleton width="55%" height={14} borderRadius={6} />
                    <Skeleton width={20} height={20} borderRadius={10} />
                </View>
            ))}
        </View>
    </View>
));

const profileStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    avatarSection: { alignItems: 'center', paddingBottom: 16 },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    statBox: { alignItems: 'center' },
    menuSection: { paddingHorizontal: 20, gap: 14 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#1E293B',
        borderRadius: 14,
        padding: 14,
    },
});
