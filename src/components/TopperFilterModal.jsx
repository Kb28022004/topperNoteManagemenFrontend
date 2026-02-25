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

const { height } = Dimensions.get('window');

const SORT_OPTIONS = [
    { label: 'Recently Joined', value: 'newest', icon: 'clock-outline' },
    { label: 'Popularity (Followers)', value: 'popularity', icon: 'trending-up' },
    { label: 'Highest Rated', value: 'rating', icon: 'star-outline' },
];

const CLASS_OPTIONS = ['10', '12'];
const BOARD_OPTIONS = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'State Board', value: 'STATE' }
];

const TopperFilterModal = ({
    visible,
    onClose,
    selectedSort,
    onSelectSort,
    selectedClass,
    onSelectClass,
    selectedBoard,
    onSelectBoard
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <AppText style={styles.headerTitle} weight="bold">Filter Toppers</AppText>
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

                            {/* Class Filter */}
                            <AppText style={styles.sectionLabel} weight="bold">CLASS</AppText>
                            <View style={styles.chipRow}>
                                <TouchableOpacity
                                    style={[styles.chip, !selectedClass && styles.activeChip]}
                                    onPress={() => onSelectClass(null)}
                                >
                                    <AppText style={[styles.chipText, !selectedClass && styles.activeChipText]}>All</AppText>
                                </TouchableOpacity>
                                {CLASS_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[styles.chip, selectedClass === item && styles.activeChip]}
                                        onPress={() => onSelectClass(item)}
                                    >
                                        <AppText style={[styles.chipText, selectedClass === item && styles.activeChipText]}>Class {item}</AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.separator} />

                            {/* Board Filter */}
                            <AppText style={styles.sectionLabel} weight="bold">BOARD</AppText>
                            <View style={styles.chipRow}>
                                <TouchableOpacity
                                    style={[styles.chip, !selectedBoard && styles.activeChip]}
                                    onPress={() => onSelectBoard(null)}
                                >
                                    <AppText style={[styles.chipText, !selectedBoard && styles.activeChipText]}>All</AppText>
                                </TouchableOpacity>
                                {BOARD_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[styles.chip, selectedBoard === item.value && styles.activeChip]}
                                        onPress={() => onSelectBoard(item.value)}
                                    >
                                        <AppText style={[styles.chipText, selectedBoard === item.value && styles.activeChipText]}>{item.label}</AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={onClose}
                            >
                                <AppText style={styles.applyBtnText} weight="bold">Apply Filters</AppText>
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
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#0F172A',
        paddingTop: 12,
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: height * 0.8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
        paddingHorizontal: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
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
        marginVertical: 18,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 2,
        marginTop: 5,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        minWidth: 70,
        alignItems: 'center',
    },
    activeChip: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3B82F6',
    },
    chipText: {
        color: '#94A3B8',
        fontSize: 13,
    },
    activeChipText: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    applyBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 35,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    applyBtnText: {
        color: 'white',
        fontSize: 16,
    },
});

export default TopperFilterModal;
