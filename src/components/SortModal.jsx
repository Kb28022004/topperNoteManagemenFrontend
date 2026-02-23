import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';

const { width, height } = Dimensions.get('window');

const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest', icon: 'clock-outline' },
    { label: 'Highest Rated', value: 'rating', icon: 'star-outline' },
    { label: 'Price: Low to High', value: 'price_low', icon: 'sort-ascending' },
    { label: 'Price: High to Low', value: 'price_high', icon: 'sort-descending' },
];

const TIME_OPTIONS = [
    { label: 'All Time', value: 'all', icon: 'calendar-range' },
    { label: 'Last 24 Hours', value: '24h', icon: 'history' },
    { label: 'Last 7 Days', value: '7d', icon: 'calendar-week' },
    { label: 'Last 1 Month', value: '1m', icon: 'calendar-month' },
];

const SortModal = ({
    visible,
    onClose,
    selectedSort,
    onSelectSort,
    selectedTime,
    onSelectTime
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <AppText style={styles.headerTitle} weight="bold">Filters & Sort</AppText>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Sorting Section */}
                            <AppText style={styles.sectionLabel} weight="bold">SORT BY</AppText>
                            {SORT_OPTIONS.map((option) => {
                                const isSelected = selectedSort === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.item, isSelected && styles.selectedItem]}
                                        onPress={() => onSelectSort(option.value)}
                                    >
                                        <View style={styles.itemContent}>
                                            <MaterialCommunityIcons
                                                name={option.icon}
                                                size={20}
                                                color={isSelected ? '#3B82F6' : '#94A3B8'}
                                            />
                                            <AppText
                                                style={[styles.itemLabel, isSelected && styles.selectedLabel]}
                                                weight={isSelected ? 'bold' : 'medium'}
                                            >
                                                {option.label}
                                            </AppText>
                                        </View>
                                        {isSelected && (
                                            <Ionicons name="checkmark-sharp" size={20} color="#3B82F6" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}

                            <View style={styles.separator} />

                            {/* Time Section */}
                            <AppText style={styles.sectionLabel} weight="bold">TIME PERIOD</AppText>
                            {TIME_OPTIONS.map((option) => {
                                const isSelected = selectedTime === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.item, isSelected && styles.selectedItem]}
                                        onPress={() => onSelectTime(option.value)}
                                    >
                                        <View style={styles.itemContent}>
                                            <MaterialCommunityIcons
                                                name={option.icon}
                                                size={20}
                                                color={isSelected ? '#3B82F6' : '#94A3B8'}
                                            />
                                            <AppText
                                                style={[styles.itemLabel, isSelected && styles.selectedLabel]}
                                                weight={isSelected ? 'bold' : 'medium'}
                                            >
                                                {option.label}
                                            </AppText>
                                        </View>
                                        {isSelected && (
                                            <Ionicons name="checkmark-sharp" size={20} color="#3B82F6" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={onClose}
                            >
                                <AppText style={styles.applyBtnText} weight="bold">Apply Changes</AppText>
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    modalContent: {
        width: width * 0.8,
        height: height,
        backgroundColor: '#0F172A',
        paddingTop: 60,
        paddingHorizontal: 15,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 5,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    closeBtn: {
        padding: 5,
    },
    sectionLabel: {
        color: '#64748B',
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 6,
        backgroundColor: '#1E293B',
    },
    selectedItem: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemLabel: {
        fontSize: 14,
        color: '#94A3B8',
    },
    selectedLabel: {
        color: '#3B82F6',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 15,
        marginHorizontal: 10,
    },
    applyBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
        marginHorizontal: 5,
    },
    applyBtnText: {
        color: 'white',
        fontSize: 16,
    }
});

export default SortModal;
