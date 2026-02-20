import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import Stepper from '../../components/Stepper'; // Assume reusable or step 1
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
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
    // Form State
    const { showAlert } = useAlert();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [shortBio, setShortBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [expertiseClass, setExpertiseClass] = useState('');
    const [board, setBoard] = useState('');
    const [stream, setStream] = useState(''); // Only if class 12
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [displayedSubjects, setDisplayedSubjects] = useState([]);

    // Achievements
    const [achievements, setAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState('');

    const [image, setImage] = useState(null);

    const [saveProfile, { isLoading: isSaving, isSuccess, data, isError, error }] = useSaveBasicProfileMutation();

    useApiFeedback(
        isSuccess,
        data,
        isError,
        error,
        () => navigation.navigate('TopperVerification'),
        "Profile saved successfully!"
    );

    useEffect(() => {
        // Simulate initial page loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

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
        setSelectedSubjects([]); // Reset when class/stream changes
    }, [expertiseClass, stream]);

    const toggleSubject = (subjectName) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(prev => prev.filter(s => s !== subjectName));
        } else {
            if (selectedSubjects.length >= 3) {
                showAlert("Wait", "You can only select up to 3 core subjects.", "warning");
                return;
            }
            setSelectedSubjects(prev => [...prev, subjectName]);
        }
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "Images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            showAlert("Error", "Failed to open gallery.", "error");
        }
    };

    const addAchievement = () => {
        if (newAchievement.trim()) {
            setAchievements([...achievements, newAchievement.trim()]);
            setNewAchievement('');
        }
    };

    const removeAchievement = (index) => {
        setAchievements(achievements.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim() || !expertiseClass || !board) {
            showAlert("Error", "Please fill all required fields", "error");
            return;
        }

        if (expertiseClass === '12' && !stream) {
            showAlert("Error", "Please select a stream for Class 12", "error");
            return;
        }

        if (selectedSubjects.length < 3) {
            showAlert("Error", "Please select exactly 3 main core subjects", "error");
            return;
        }

        if (achievements.length === 0) {
            showAlert("Error", "Please add at least one achievement", "error");
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
            const type = match ? `image/${match[1]}` : `image`;
            formData.append("profilePhoto", { uri: image, name: filename, type });
        }

        try {
            await saveProfile(formData).unwrap();
        } catch (err) {
            console.log("Topper Profile Error:", err);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Loader visible={isLoading} />
            <View style={styles.container}>
                <Header title="Setup Topper Profile" />
                <AppText style={styles.subTitleHeader}>Share your academic details to build trust.</AppText>

                <Stepper currentStep={1} totalSteps={2} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Photo */}
                    <View style={styles.profileSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            <Image
                                source={image ? { uri: image } : require('../../../assets/topper.avif')}
                                style={styles.avatar} // Placeholder needed if not available
                            />
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={14} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Names */}
                    <View style={styles.rowBetween}>
                        <View style={styles.halfWidth}>
                            <AppText style={styles.label}>First Name</AppText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter First Name"
                                placeholderTextColor="#666"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <AppText style={styles.label}>Last Name</AppText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Last Name"
                                placeholderTextColor="#666"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    {/* Short Bio */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Short Bio</AppText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell students about your study techniques..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={3}
                            value={shortBio}
                            onChangeText={setShortBio}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Expertise Class */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons name="school" size={16} color="#4377d8ff" style={{ marginRight: 5 }} />
                            <AppText style={styles.label}>Expertise Class</AppText>
                        </View>
                        <CustomDropdown
                            options={CLASSES}
                            selectedValue={expertiseClass}
                            onSelect={setExpertiseClass}
                            placeholder="Select your class (e.g. Class 12)"
                        />
                    </View>

                    {/* Stream (Conditionally for 12) */}
                    {expertiseClass === '12' && (
                        <View style={styles.formGroup}>
                            <AppText style={styles.label}>Stream</AppText>
                            <CustomDropdown
                                options={STREAMS}
                                selectedValue={stream}
                                onSelect={setStream}
                                placeholder="Select Stream"
                            />
                        </View>
                    )}

                    {/* Board */}
                    <View style={styles.formGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons name="book" size={16} color="#4377d8ff" style={{ marginRight: 5 }} />
                            <AppText style={styles.label}>Education Board</AppText>
                        </View>
                        <CustomDropdown
                            options={BOARDS}
                            selectedValue={board}
                            onSelect={setBoard}
                            placeholder="Select Board (e.g. CBSE)"
                        />
                    </View>

                    {/* Core Subjects Selection */}
                    {displayedSubjects.length > 0 && (
                        <View style={styles.formGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="list" size={16} color="#4377d8ff" style={{ marginRight: 5 }} />
                                <AppText style={styles.label}>Select 3 Core Subjects</AppText>
                            </View>
                            <AppText style={styles.subLabel}>Choose subjects you excel in.</AppText>
                            <View style={styles.subjectsGrid}>
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
                        </View>
                    )}

                    {/* Achievements */}
                    <View style={styles.formGroup}>
                        <View style={styles.rowBetween}>
                            <View style={styles.labelRow}>
                                <Ionicons name="trophy" size={16} color="#4377d8ff" style={{ marginRight: 5 }} />
                                <AppText style={styles.label}>Topper Achievements</AppText>
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

                        <View style={styles.addInputContainer}>
                            <TextInput
                                style={styles.addInput}
                                placeholder="e.g. Gold Medal in Math Olympiad"
                                placeholderTextColor="#666"
                                value={newAchievement}
                                onChangeText={setNewAchievement}
                            />
                            <TouchableOpacity onPress={addAchievement} style={styles.addButton}>
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
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
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 55,
    },
    subTitleHeader: {
        color: '#a0aec0',
        fontSize: 14,
        marginTop: -10, // Adjust based on Header spacing
        marginBottom: 20,
        textAlign: 'center'
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4377d8ff',
        backgroundColor: '#2d3748', // Fallback color
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4377d8ff',
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#1a202c',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'center'
    },
    halfWidth: {
        width: '48%',
    },
    formGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        color: '#718096',
    },
    input: {
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    textArea: {
        height: 100,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4a5568',
        gap: 8,
    },
    chipText: {
        color: '#90cdf4',
        fontSize: 14,
        fontWeight: '600'
    },
    addInputContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    addInput: {
        flex: 1,
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    addButton: {
        backgroundColor: '#2d3748',
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    saveButton: {
        marginTop: 10,
        marginBottom: 30,
        backgroundColor: '#4299e1', // Topper blue
    },
    subLabel: {
        fontSize: 12,
        color: '#a0aec0',
        marginBottom: 10,
    },
    subjectsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    subjectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        gap: 8,
    },
    subjectChipSelected: {
        backgroundColor: '#4377d8ff',
        borderColor: '#4377d8ff',
    },
    subjectText: {
        color: '#a0aec0',
        fontSize: 14,
    },
    subjectTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
});

export default TopperProfileSetup;
