import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import Stepper from '../../components/Stepper';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import FormField from '../../components/FormField';
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../../components/CustomDropdown';
import { useSaveBasicProfileMutation } from '../../features/api/topperApi';
import useApiFeedback from '../../hooks/useApiFeedback';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';

// Constants
const CLASSES = ['10', '12'];
const BOARDS = ['CBSE', 'ICSE', 'STATE'];
const STREAMS = ['SCIENCE', 'COMMERCE', 'ARTS'];

const SUBJECTS_DATA = {
    '10': [
        { id: 'Maths', name: 'Maths', icon: 'calculator' },
        { id: 'Science', name: 'Science', icon: 'flask' },
        { id: 'English', name: 'English', icon: 'book' },
        { id: 'SST', name: 'Social Studies', icon: 'earth' },
        { id: 'Hindi', name: 'Hindi', icon: 'language' },
    ],
    'SCIENCE': [
        { id: 'Physics', name: 'Physics', icon: 'flash' },
        { id: 'Chemistry', name: 'Chemistry', icon: 'flask' },
        { id: 'Maths', name: 'Maths', icon: 'calculator' },
        { id: 'Biology', name: 'Biology', icon: 'leaf' },
        { id: 'Comp. Sci', name: 'Comp. Sci', icon: 'laptop' },
    ],
    'COMMERCE': [
        { id: 'Accountancy', name: 'Accountancy', icon: 'calculator' },
        { id: 'Business Studies', name: 'Business Studies', icon: 'briefcase' },
        { id: 'Economics', name: 'Economics', icon: 'cash' },
        { id: 'Maths', name: 'Maths', icon: 'calculator' },
    ],
    'ARTS': [
        { id: 'History', name: 'History', icon: 'time' },
        { id: 'Political Science', name: 'Pol. Science', icon: 'people' },
        { id: 'Geography', name: 'Geography', icon: 'earth' },
        { id: 'Economics', name: 'Economics', icon: 'cash' },
    ]
};

const TopperProfileSetup = ({ navigation }) => {
    const { showAlert } = useAlert();

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [shortBio, setShortBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [expertiseClass, setExpertiseClass] = useState('');
    const [board, setBoard] = useState('');
    const [stream, setStream] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [displayedSubjects, setDisplayedSubjects] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState('');
    const [image, setImage] = useState(null);

    // ─── Validation Errors State ─────────────────────────────────────────────
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const [saveProfile, { isLoading: isSaving, isSuccess, data, isError, error }] = useSaveBasicProfileMutation();

    useApiFeedback(
        isSuccess, data, isError, error,
        () => navigation.navigate('TopperVerification'),
        "Profile saved successfully!"
    );

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let subjects = [];
        if (expertiseClass === '10') {
            subjects = SUBJECTS_DATA['10'];
        } else if (expertiseClass === '12' && stream) {
            subjects = SUBJECTS_DATA[stream] || [];
        }
        setDisplayedSubjects(subjects);
        setSelectedSubjects([]);
        // Clear stream error when class changes
        if (submitted) validateForm({ expertiseClass, stream: expertiseClass === '12' ? stream : 'ok' });
    }, [expertiseClass, stream]);

    // ─── Live validation (only after first submit attempt) ───────────────────
    const validateForm = (overrides = {}) => {
        const v = {
            firstName: overrides.firstName ?? firstName,
            lastName: overrides.lastName ?? lastName,
            expertiseClass: overrides.expertiseClass ?? expertiseClass,
            board: overrides.board ?? board,
            stream: overrides.stream ?? stream,
        };
        const e = {};
        if (!v.firstName.trim()) e.firstName = 'First name is required';
        if (!v.lastName.trim()) e.lastName = 'Last name is required';
        if (!v.expertiseClass) e.expertiseClass = 'Please select a class';
        if (v.expertiseClass === '12' && !v.stream) e.stream = 'Please select a stream';
        if (!v.board) e.board = 'Please select a board';
        if (selectedSubjects.length < 1) e.subjects = 'Select at least one core subject';
        if (achievements.length === 0) e.achievements = 'Add at least one achievement';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const toggleSubject = (subjectName) => {
        let updated;
        if (selectedSubjects.includes(subjectName)) {
            updated = selectedSubjects.filter(s => s !== subjectName);
        } else {
            updated = [...selectedSubjects, subjectName];
        }
        setSelectedSubjects(updated);
        if (submitted) {
            setErrors(prev => ({
                ...prev,
                subjects: updated.length < 1 ? 'Select at least one core subject' : null,
            }));
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "Images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
        } catch {
            showAlert("Error", "Failed to open gallery.", "error");
        }
    };

    const addAchievement = () => {
        if (newAchievement.trim()) {
            const updated = [...achievements, newAchievement.trim()];
            setAchievements(updated);
            setNewAchievement('');
            if (submitted) setErrors(prev => ({ ...prev, achievements: null }));
        }
    };

    const removeAchievement = (index) => {
        const updated = achievements.filter((_, i) => i !== index);
        setAchievements(updated);
        if (submitted && updated.length === 0)
            setErrors(prev => ({ ...prev, achievements: 'Add at least one achievement' }));
    };

    const handleSave = async () => {
        setSubmitted(true);
        const valid = validateForm();
        if (!valid) {
            showAlert("Missing Fields", "Please fill all required fields marked with *", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        if (shortBio) formData.append("shortBio", shortBio);
        formData.append("expertiseClass", expertiseClass);
        formData.append("board", board);
        if (expertiseClass === '12') formData.append("stream", stream);
        selectedSubjects.forEach(sub => formData.append("coreSubjects[]", sub));
        achievements.forEach(ach => formData.append("achievements[]", ach));

        if (image) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            formData.append("profilePhoto", { uri: image, name: filename, type: match ? `image/${match[1]}` : 'image' });
        }

        try {
            await saveProfile(formData).unwrap();
        } catch (err) { /* handled by useApiFeedback */ }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.mainContainer}>
                <Loader visible={isLoading} />
                <View style={styles.container}>
                    <Header title="Setup Topper Profile" />
                    <AppText style={styles.subTitleHeader}>Share your academic details to build trust.</AppText>
                    <Stepper currentStep={1} totalSteps={2} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >

                        {/* Profile Photo */}
                        <View style={styles.profileSection}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                <Image
                                    source={image ? { uri: image } : require('../../../assets/topper.avif')}
                                    style={styles.avatar}
                                />
                                <View style={styles.cameraIcon}>
                                    <Ionicons name="camera" size={14} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Names */}
                        <View style={styles.rowBetween}>
                            <View style={styles.halfWidth}>
                                <FormField
                                    label="First Name"
                                    required
                                    error={errors.firstName}
                                    placeholder="Enter First Name"
                                    value={firstName}
                                    onChangeText={(t) => {
                                        setFirstName(t);
                                        if (submitted) setErrors(prev => ({ ...prev, firstName: t.trim() ? null : 'First name is required' }));
                                    }}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <FormField
                                    label="Last Name"
                                    required
                                    error={errors.lastName}
                                    placeholder="Enter Last Name"
                                    value={lastName}
                                    onChangeText={(t) => {
                                        setLastName(t);
                                        if (submitted) setErrors(prev => ({ ...prev, lastName: t.trim() ? null : 'Last name is required' }));
                                    }}
                                />
                            </View>
                        </View>

                        {/* Short Bio */}
                        <FormField
                            label="Short Bio"
                            placeholder="Tell students about your study techniques..."
                            value={shortBio}
                            onChangeText={setShortBio}
                            multiline
                            numberOfLines={3}
                            inputStyle={styles.textArea}
                            textAlignVertical="top"
                        />

                        {/* Expertise Class */}
                        <FormField label="Expertise Class" required error={errors.expertiseClass}>
                            <CustomDropdown
                                options={CLASSES}
                                selectedValue={expertiseClass}
                                onSelect={(v) => {
                                    setExpertiseClass(v);
                                    if (submitted) setErrors(prev => ({ ...prev, expertiseClass: v ? null : 'Please select a class' }));
                                }}
                                placeholder="Select your class (e.g. Class 12)"
                            />
                        </FormField>

                        {/* Stream (Conditionally for Class 12) */}
                        {expertiseClass === '12' && (
                            <FormField label="Stream" required error={errors.stream}>
                                <CustomDropdown
                                    options={STREAMS}
                                    selectedValue={stream}
                                    onSelect={(v) => {
                                        setStream(v);
                                        if (submitted) setErrors(prev => ({ ...prev, stream: v ? null : 'Please select a stream' }));
                                    }}
                                    placeholder="Select Stream"
                                />
                            </FormField>
                        )}

                        {/* Board */}
                        <FormField label="Education Board" required error={errors.board}>
                            <CustomDropdown
                                options={BOARDS}
                                selectedValue={board}
                                onSelect={(v) => {
                                    setBoard(v);
                                    if (submitted) setErrors(prev => ({ ...prev, board: v ? null : 'Please select a board' }));
                                }}
                                placeholder="Select Board (e.g. CBSE)"
                            />
                        </FormField>

                        {/* Core Subjects */}
                        {displayedSubjects.length > 0 && (
                            <View style={styles.formGroup}>
                                <View style={styles.labelRow}>
                                    <AppText style={styles.label}>Core Subjects</AppText>
                                    <AppText style={styles.required}> *</AppText>
                                </View>
                                <AppText style={styles.subLabel}>Select all subjects you teach.</AppText>
                                <View style={[styles.subjectsGrid, errors.subjects && styles.errorGroupBorder]}>
                                    {displayedSubjects.map((sub) => {
                                        const isSelected = selectedSubjects.includes(sub.id);
                                        return (
                                            <TouchableOpacity
                                                key={sub.id}
                                                style={[styles.subjectChip, isSelected && styles.subjectChipSelected]}
                                                onPress={() => toggleSubject(sub.id)}
                                            >
                                                <Ionicons name={sub.icon} size={16} color={isSelected ? "white" : "#a0aec0"} />
                                                <AppText style={[styles.subjectText, isSelected && styles.subjectTextSelected]}>
                                                    {sub.name}
                                                </AppText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                {errors.subjects && <AppText style={styles.errorText}>{errors.subjects}</AppText>}
                            </View>
                        )}

                        {/* Achievements */}
                        <View style={styles.formGroup}>
                            <View style={styles.labelRowBetween}>
                                <View style={styles.labelRow}>
                                    <Ionicons name="trophy" size={16} color="#4377d8ff" style={{ marginRight: 5 }} />
                                    <AppText style={styles.label}>Topper Achievements</AppText>
                                    <AppText style={styles.required}> *</AppText>
                                </View>
                                <AppText style={styles.hint}>Add at least one</AppText>
                            </View>

                            <View style={styles.chipsContainer}>
                                {achievements.map((ach, index) => (
                                    <View key={index} style={styles.chip}>
                                        <AppText style={styles.chipText}>{ach}</AppText>
                                        <TouchableOpacity onPress={() => removeAchievement(index)}>
                                            <Ionicons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={[styles.addInputContainer, errors.achievements && styles.errorGroupBorder]}>
                                <TextInput
                                    style={styles.addInput}
                                    placeholder="e.g. Gold Medal in Math Olympiad"
                                    placeholderTextColor="#666"
                                    value={newAchievement}
                                    onChangeText={setNewAchievement}
                                    onSubmitEditing={addAchievement}
                                />
                                <TouchableOpacity onPress={addAchievement} style={styles.addButton}>
                                    <Ionicons name="add" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                            {errors.achievements && <AppText style={styles.errorText}>{errors.achievements}</AppText>}
                        </View>

                        <ReusableButton
                            title={isSaving ? "Saving..." : "Proceed to Verification"}
                            onPress={handleSave}
                            icon="arrow-forward"
                            style={styles.saveButton}
                            disabled={isSaving}
                        />

                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 55 },
    subTitleHeader: { color: '#a0aec0', fontSize: 14, marginTop: -10, marginBottom: 20, textAlign: 'center' },
    scrollContent: { paddingBottom: 40 },
    profileSection: { alignItems: 'center', marginVertical: 20 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#4377d8ff', backgroundColor: '#2d3748' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4377d8ff', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#1a202c' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    halfWidth: { width: '48%' },
    formGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    labelRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#E2E8F0' },
    required: { fontSize: 15, color: '#EF4444', fontWeight: '700' },
    hint: { fontSize: 12, color: '#718096' },
    subLabel: { fontSize: 12, color: '#a0aec0', marginBottom: 10 },
    textArea: { height: 100 },
    subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 4 },
    errorGroupBorder: { borderRadius: 12, borderWidth: 1.5, borderColor: '#EF4444', padding: 8 },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 5 },
    subjectChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(58, 60, 63, 0.5)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: 8 },
    subjectChipSelected: { backgroundColor: '#4377d8ff', borderColor: '#4377d8ff' },
    subjectText: { color: '#a0aec0', fontSize: 14 },
    subjectTextSelected: { color: 'white', fontWeight: '600' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d3748', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#4a5568', gap: 8 },
    chipText: { color: '#90cdf4', fontSize: 14, fontWeight: '600' },
    addInputContainer: { flexDirection: 'row', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    addInput: { flex: 1, backgroundColor: 'rgba(58, 60, 63, 0.5)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15, color: 'white', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    addButton: { backgroundColor: '#2d3748', width: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    saveButton: { marginTop: 10, marginBottom: 30, backgroundColor: '#4299e1' },
});

export default TopperProfileSetup;
