import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import AppText from './AppText';
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder = "Select" }) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setIsVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <AppText style={styles.label}>{label}</AppText>}

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsVisible(true)}
            >
                <AppText style={[styles.selectedText, !selectedValue && styles.placeholderText]}>
                    {selectedValue || placeholder}
                </AppText>
                <Ionicons name="chevron-down" size={20} color="#ccc" />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <AppText style={styles.modalTitle}>Select {label}</AppText>
                            <ScrollView
                                contentContainerStyle={styles.optionsList}
                                showsVerticalScrollIndicator={false}
                            >
                                {options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.optionItem,
                                            selectedValue === option && styles.selectedOptionItem
                                        ]}
                                        onPress={() => handleSelect(option)}
                                    >
                                        <AppText style={[
                                            styles.optionText,
                                            selectedValue === option && styles.selectedOptionText
                                        ]}>
                                            {option}
                                        </AppText>
                                        {selectedValue === option && (
                                            <Ionicons name="checkmark" size={20} color="#4377d8ff" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    dropdownButton: {
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedText: {
        color: 'white',
        fontSize: 14,
    },
    placeholderText: {
        color: '#a0aec0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a202c',
        borderRadius: 16,
        padding: 20,
        maxHeight: '70%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        textAlign: 'center',
    },
    optionsList: {
        paddingBottom: 10,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedOptionItem: {
        backgroundColor: 'rgba(67, 119, 216, 0.1)', // Light blue tint
        borderRadius: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 0,
    },
    optionText: {
        fontSize: 16,
        color: '#a0aec0',
    },
    selectedOptionText: {
        color: '#4377d8ff',
        fontWeight: 'bold',
    },
});

export default CustomDropdown;
