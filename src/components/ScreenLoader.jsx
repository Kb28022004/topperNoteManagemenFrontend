import React, { memo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Loader from './Loader';

const ScreenLoader = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Loader visible={true} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(ScreenLoader);
