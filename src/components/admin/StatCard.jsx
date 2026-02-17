import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../AppText';
import { Ionicons } from "@expo/vector-icons";

const StatCard = ({ title, value, icon, color, percentage }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { borderColor: color }]}>
                    <Ionicons name={icon} size={18} color={color} />
                </View>
                {percentage && (
                    <View style={[styles.badge, { backgroundColor: 'rgba(56, 161, 105, 0.2)' }]}>
                        <AppText style={styles.badgeText}>{percentage}</AppText>
                    </View>
                )}
            </View>

            <AppText style={styles.label}>{title}</AppText>
            <AppText style={styles.value}>{value}</AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2d3748',
        borderRadius: 16,
        padding: 15,
        width: '48%',
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#48bb78',
        fontSize: 10,
        fontWeight: 'bold',
    },
    label: {
        color: '#a0aec0',
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default StatCard;
