import React, { memo, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';

import { useToggleFavoriteNoteMutation } from '../features/api/noteApi';
import { useAlert } from '../context/AlertContext';

const { width } = Dimensions.get('window');

const NoteCard = memo(({ note, onPress }) => {
    const [toggleFavorite] = useToggleFavoriteNoteMutation();
    const { showAlert } = useAlert();
    const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);

    // Sync local state with prop
    useEffect(() => {
        setIsFavorite(note?.isFavorite || false);
    }, [note?.isFavorite]);

    const handleToggleFavorite = useCallback(async () => {
        const prev = isFavorite;
        try {
            setIsFavorite(!prev); // optimistic
            await toggleFavorite(note?._id || note?.id).unwrap();
        } catch (error) {
            console.error("Favorite Note Error:", error);
            setIsFavorite(prev); // revert
            showAlert("Error", "Failed to update favorite status", "error");
        }
    }, [isFavorite, note?._id, note?.id]);

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
            <View style={styles.imageWrapper}>
                <Image
                    source={note?.thumbnail ? { uri: note?.thumbnail } : require('../../assets/topper.avif')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(15, 23, 42, 0.7)']}
                    style={styles.gradient}
                />

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleToggleFavorite}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={18}
                        color={isFavorite ? "#F43F5E" : "white"}
                    />
                </TouchableOpacity>

                <View style={styles.ratingBox}>
                    <Ionicons name="star" size={10} color="#FBBF24" />
                    <AppText style={styles.ratingVal}>{note?.stats?.ratingAvg || '4.5'}</AppText>
                </View>

                <View style={styles.classTag}>
                    <AppText style={styles.classTagText}>CL-{note?.class}</AppText>
                </View>
            </View>

            <View style={styles.details}>
                <AppText style={styles.subjectText} weight="bold">{note?.subject?.toUpperCase()}</AppText>
                <AppText style={styles.titleText} numberOfLines={2} weight="medium">
                    {note?.title || note?.chapterName}
                </AppText>

                <View style={styles.footerRow}>
                    <AppText style={styles.priceText} weight="bold">₹{typeof note?.price === 'object' ? note.price.current : (note?.price || '0')}</AppText>
                    <View style={[styles.statusIndicator, { backgroundColor: note?.isPurchased ? '#10B98120' : '#00B1FC20' }]}>
                        <Ionicons
                            name={note?.isPurchased ? "checkmark-circle" : "chevron-forward"}
                            size={14}
                            color={note?.isPurchased ? '#10B981' : '#00B1FC'}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: (width - 40) / 2 - 10,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#33415550',
    },
    imageWrapper: {
        height: 130,
        position: 'relative',
        backgroundColor: '#334155',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ratingBox: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    saveBtn: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    ratingVal: {
        color: 'white',
        fontSize: 9,
    },
    classTag: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#00B1FC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    classTagText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    details: {
        padding: 12,
    },
    subjectText: {
        fontSize: 9,
        color: '#00B1FC',
        letterSpacing: 1,
        marginBottom: 4,
    },
    titleText: {
        color: 'white',
        fontSize: 13,
        height: 36,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    priceText: {
        color: 'white',
        fontSize: 15,
    },
    statusIndicator: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default NoteCard;
