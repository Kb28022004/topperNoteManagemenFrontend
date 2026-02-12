import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import AppText from './AppText';

const Loader = ({ visible = false }) => {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.container}>
                <View style={styles.loaderContent}>
                    <ActivityIndicator size="large" color="#f9fbffff" />
                    <AppText style={styles.text}>Loading...</AppText>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent dark background
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContent: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
});

export default Loader;
