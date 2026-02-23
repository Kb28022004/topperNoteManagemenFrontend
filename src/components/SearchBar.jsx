import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = "Search...",
    onFilterPress,
    isFilterActive = false,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.inputWrapper}>
                <Feather name="search" size={20} color="#94A3B8" />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#64748B"
                    value={value}
                    onChangeText={onChangeText}
                    returnKeyType="search"
                />
            </View>
            <TouchableOpacity
                style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
                onPress={onFilterPress}
            >
                <Ionicons
                    name="options-outline"
                    size={24}
                    color={isFilterActive ? '#fff' : '#00B1FC'}
                />
                {isFilterActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#334155',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
        fontSize: 15,
        height: '100%',
    },
    filterBtn: {
        width: 50,
        height: 50,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        position: 'relative',
    },
    filterBtnActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    activeDot: {
        position: 'absolute',
        top: 9,
        right: 9,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FBBF24',
        borderWidth: 1.5,
        borderColor: '#3B82F6',
    },
});

export default SearchBar;
