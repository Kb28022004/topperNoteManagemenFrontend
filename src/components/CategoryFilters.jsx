import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';

const CategoryFilters = ({
    categories = [],
    activeCategory,
    onSelectCategory,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            activeCategory === item && styles.activeChip
                        ]}
                        onPress={() => onSelectCategory(item)}
                    >
                        <AppText style={[
                            styles.text,
                            activeCategory === item && styles.activeText
                        ]}>
                            {item}
                        </AppText>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    listContent: {

        gap: 10,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeChip: {
        backgroundColor: '#00B1FC',
        borderColor: '#00B1FC',
    },
    text: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CategoryFilters;
