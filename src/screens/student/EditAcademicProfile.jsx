import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import CustomDropdown from '../../components/CustomDropdown';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../features/api/studentApi';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';

const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board'];
const STREAMS = ['Science (PCM)', 'Science (PCB)', 'Science (PCMB)', 'Commerce', 'Arts'];

const EditAcademicProfile = ({ navigation }) => {
    const { showAlert } = useAlert();
    const { data: profile, isLoading: isFetchingProfile } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedBoard, setSelectedBoard] = useState('');
    const [selectedStream, setSelectedStream] = useState('');

    useEffect(() => {
        if (profile) {
            setSelectedClass(profile.class || '');
            setSelectedBoard(profile.board || '');
            setSelectedStream(profile.stream || '');
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            const payload = {
                class: selectedClass,
                board: selectedBoard,
                stream: selectedStream
            };

            await updateProfile(payload).unwrap();
            showAlert("Success", "Academic profile updated successfully!", "success");
            navigation.goBack();
        } catch (err) {
            showAlert("Error", "Failed to update profile", "error");
        }
    };

    if (isFetchingProfile) return <Loader visible />;

    const isHigherSecondary = ['11', '12'].includes(selectedClass);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Academic Profile</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AppText style={styles.infoText}>
                    Update your academic details to see notes relevant to your current class and board.
                </AppText>

                {/* Class Selection */}
                <View style={styles.formGroup}>
                    <AppText style={styles.label}>Class</AppText>
                    <View style={styles.chipRow}>
                        {CLASSES.map((cls) => (
                            <TouchableOpacity
                                key={cls}
                                style={[styles.chip, selectedClass === cls && styles.chipSelected]}
                                onPress={() => {
                                    setSelectedClass(cls);
                                    if (!['11', '12'].includes(cls)) setSelectedStream('');
                                }}
                            >
                                <AppText style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>
                                    {cls}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Board Selection */}
                <View style={styles.formGroup}>
                    <AppText style={styles.label}>Board</AppText>
                    <CustomDropdown
                        options={BOARDS}
                        selectedValue={selectedBoard}
                        onSelect={setSelectedBoard}
                        placeholder="Select Board"
                    />
                </View>

                {/* Stream Selection (Conditional) */}
                {isHigherSecondary && (
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Stream</AppText>
                        <CustomDropdown
                            options={STREAMS}
                            selectedValue={selectedStream}
                            onSelect={setSelectedStream}
                            placeholder="Choose Stream"
                        />
                    </View>
                )}

                <View style={{ marginTop: 20 }}>
                    <ReusableButton
                        title={isUpdating ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        disabled={isUpdating}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    scrollContent: {
        padding: 24,
    },
    infoText: {
        color: '#94A3B8',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    chipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    chipText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: 'bold',
    },
    chipTextSelected: {
        color: 'white',
    },
});

export default EditAcademicProfile;
