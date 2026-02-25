import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

const NoDataFound = ({
    message = "No data found",
    icon = "alert-circle-outline",
    containerStyle,
    textStyle
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.iconWrapper}>
                <Ionicons name={icon} size={32} color="#475569" />
            </View>
            <AppText style={[styles.message, textStyle]}>
                {message}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        marginVertical: 10,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    message: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default NoDataFound;
