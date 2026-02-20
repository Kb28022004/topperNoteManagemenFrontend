import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';

const { width } = Dimensions.get('window');

const NoteCard = ({ note, onPress, onAddToCart }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={note?.thumbnail ? { uri: note?.thumbnail } : require('../../assets/topper.avif')}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <AppText style={styles.ratingText}>
                        {typeof note?.rating === 'number' ? note?.rating.toFixed(1) : (note?.rating || '4.5')}
                    </AppText>
                </View>

                {/* Class Badge */}
                {note?.class && (
                    <View style={styles.classBadge}>
                        <AppText style={styles.classText}>Class {note?.class}</AppText>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <AppText style={styles.title} numberOfLines={2} weight="bold">
                    {note?.title || `${note?.subject} - ${note?.chapterName}`}
                </AppText>

                <View style={styles.authorRow}>
                    <AppText style={styles.authorName} numberOfLines={1}>
                        {note?.topperId?.fullName || 'Topper Name'}
                    </AppText>
                    {(note?.isVerified || note?.topperId?.isVerified || note?.topperId?.status === 'APPROVED') && (
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                    )}
                </View>

                <View style={styles.footer}>
                    <AppText style={styles.price} weight="bold">
                        {note?.price ? `₹${note?.price}` : 'Free'}
                    </AppText>

                    <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
                        <Ionicons name="bag-handle" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: (width - 45) / 2,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        height: 300,
    },
    imageContainer: {
        height: 170,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#334155',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        gap: 3,
    },
    ratingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    classBadge: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    classText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: 10,
    },
    title: {
        color: 'white',
        fontSize: 14,
        height: 40,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    authorName: {
        color: '#94A3B8',
        fontSize: 12,
        maxWidth: '85%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        color: 'white',
        fontSize: 16,
    },
    cartButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NoteCard;
