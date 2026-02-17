import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import Stepper from '../../components/Stepper';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../../components/CustomDropdown';
import { useCreateProfileMutation } from '../../features/api/studentApi';
import useApiFeedback from '../../hooks/useApiFeedback';
import Loader from '../../components/Loader';

// Mock Data
const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board'];
const MEDIUMS = ['ENGLISH', 'HINDI'];
const STREAMS = ['Science (PCM)', 'Science (PCB)', 'Science (PCMB)', 'Commerce', 'Arts'];

const SUBJECTS_DATA = {
    general: [
        { id: 'maths', name: 'Maths', icon: 'calculator' },
        { id: 'science', name: 'Science', icon: 'flask' },
        { id: 'english', name: 'English', icon: 'book' },
        { id: 'sst', name: 'Social Studies', icon: 'earth' },
        { id: 'hindi', name: 'Hindi', icon: 'language' },
        { id: 'sanskrit', name: 'Sanskrit', icon: 'book' },
    ],
    pcmb: [
        { id: 'phy', name: 'Physics', icon: 'flash' },
        { id: 'chem', name: 'Chemistry', icon: 'flask' },
        { id: 'maths', name: 'Maths', icon: 'calculator' },
        { id: 'bio', name: 'Biology', icon: 'leaf' },
        { id: 'english', name: 'English', icon: 'book' },
        { id: 'cs', name: 'Comp. Sci', icon: 'laptop' },
        { id: 'pe', name: 'Physical Edu.', icon: 'basketball' },
    ],
    commerce: [
        { id: 'acc', name: 'Accountancy', icon: 'calculator' },
        { id: 'bst', name: 'Business Studies', icon: 'briefcase' },
        { id: 'eco', name: 'Economics', icon: 'cash' },
        { id: 'maths', name: 'Maths', icon: 'calculator' },
        { id: 'english', name: 'English', icon: 'book' },
        { id: 'ip', name: 'Info. Prac.', icon: 'laptop' },
    ],
    arts: [
        { id: 'hist', name: 'History', icon: 'time' },
        { id: 'pol', name: 'Pol. Science', icon: 'people' },
        { id: 'geo', name: 'Geography', icon: 'earth' },
        { id: 'eco', name: 'Economics', icon: 'cash' },
        { id: 'english', name: 'English', icon: 'book' },
        { id: 'psych', name: 'Psychology', icon: 'brain' },
    ]
};

const StudentProfileSetup = ({ navigation }) => {
    // ... (State hooks remain same)
    const [fullName, setFullName] = useState('');
    const [selectedClass, setSelectedClass] = useState('11');
    const [selectedBoard, setSelectedBoard] = useState('CBSE');
    const [selectedMedium, setSelectedMedium] = useState('ENGLISH');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [displayedSubjects, setDisplayedSubjects] = useState([]);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    const [createProfile, { isLoading: createProfileLoading, isSuccess, data, isError, error }] = useCreateProfileMutation();

    useEffect(() => {
        // Simulate initial page loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useApiFeedback(
        isSuccess,
        data,
        isError,
        error,
        () => navigation.navigate('Home'),
        "Profile created successfully!"
    );

    // Filter Subjects based on Class and Stream
    useEffect(() => {
        let subjects = [];
        const isHigherClass = ['11', '12', 'Dropper'].includes(selectedClass);

        if (!isHigherClass) {
            // General subjects for < 11
            subjects = SUBJECTS_DATA.general;
            if (selectedStream) setSelectedStream(''); // Reset stream
        } else {
            // Stream based subjects
            if (selectedStream.includes('PCM') || selectedStream.includes('PCB')) {
                subjects = SUBJECTS_DATA.pcmb;
            } else if (selectedStream === 'Commerce') {
                subjects = SUBJECTS_DATA.commerce;
            } else if (selectedStream === 'Arts') {
                subjects = SUBJECTS_DATA.arts;
            } else {
                subjects = []; // Wait for stream selection
            }
        }
        setDisplayedSubjects(subjects);
    }, [selectedClass, selectedStream]);

    const pickImage = async () => {
        try {
            console.log("Requesting image picker...");

            // Launch image picker directly - it handles permissions automatically
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "Images", // Fallback to string if enum fails
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            console.log("Image picker result:", result);

            if (!result.canceled) {
                console.log("Image selected:", result.assets[0].uri);
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to open gallery. Please try again.");
        }
    };

    const toggleSubject = (subjectId) => {
        if (selectedSubjects.includes(subjectId)) {
            setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
        } else {
            setSelectedSubjects(prev => [...prev, subjectId]);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert("Error", "Please enter your full name");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("class", selectedClass);
        formData.append("board", selectedBoard);
        formData.append("medium", selectedMedium);
        if (selectedStream) formData.append("stream", selectedStream);
        selectedSubjects.forEach(subj => formData.append("subjects", subj));

        if (image) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append("photo", { uri: image, name: filename, type });
        }

        try {
            await createProfile(formData).unwrap();
        } catch (err) {
            console.log("Profile Creation Error:", JSON.stringify(err, null, 2));
        }
    };

    const isHigherSecondary = ['11', '12', 'Dropper'].includes(selectedClass);

    return (
        <View style={styles.mainContainer}>
            <Loader visible={isLoading} />
            <View style={styles.container}>
                <Header title="Set up your profile" />
                <Stepper currentStep={3} totalSteps={3} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Photo */}
                    <View style={styles.profileSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            <Image
                                source={image ? { uri: image } : require('../../../assets/student.avif')} // Placeholder or default
                                style={styles.avatar}
                            />
                            <View style={styles.editIcon}>
                                <Ionicons name="pencil" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage}>
                            <AppText style={styles.uploadText}>Upload Photo</AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Full Name */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Full Name</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Full Name"
                            placeholderTextColor="#666"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Class Selection */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Which class are you in?</AppText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.row}>
                                {CLASSES.map((cls) => (
                                    <TouchableOpacity
                                        key={cls}
                                        style={[styles.chip, selectedClass === cls && styles.chipSelected]}
                                        onPress={() => setSelectedClass(cls)}
                                    >
                                        <AppText style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>
                                            {cls}
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Stream Selection (Conditional) */}
                    {isHigherSecondary && (
                        <View style={styles.formGroup}>
                            <AppText style={styles.label}>Select Stream</AppText>
                            <CustomDropdown
                                options={STREAMS}
                                selectedValue={selectedStream}
                                onSelect={setSelectedStream}
                                placeholder="Choose Stream"
                            />
                        </View>
                    )}

                    {/* Board & Medium */}
                    <View style={styles.rowBetween}>
                        <View style={styles.halfWidth}>
                            <AppText style={styles.label}>Board</AppText>
                            <CustomDropdown
                                options={BOARDS}
                                selectedValue={selectedBoard}
                                onSelect={setSelectedBoard}
                                placeholder="Select Board"
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <AppText style={styles.label}>Medium</AppText>
                            <CustomDropdown
                                options={MEDIUMS}
                                selectedValue={selectedMedium}
                                onSelect={setSelectedMedium}
                                placeholder="Select Medium"
                            />
                        </View>
                    </View>

                    {/* Subjects */}
                    {displayedSubjects.length > 0 && (
                        <View style={styles.formGroup}>
                            <AppText style={styles.label}>Subjects of Interest</AppText>
                            <AppText style={styles.subLabel}>Pick at least 3 subjects to personalize your feed.</AppText>
                            <View style={styles.subjectsGrid}>
                                {displayedSubjects.map((sub) => {
                                    const isSelected = selectedSubjects.includes(sub.id);
                                    return (
                                        <TouchableOpacity
                                            key={sub.id}
                                            style={[styles.subjectChip, isSelected && styles.subjectChipSelected]}
                                            onPress={() => toggleSubject(sub.id)}
                                        >
                                            <Ionicons name={sub.icon} size={18} color={isSelected ? "white" : "#a0aec0"} />
                                            <AppText style={[styles.subjectText, isSelected && styles.subjectTextSelected]}>
                                                {sub.name}
                                            </AppText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <ReusableButton
                        title={createProfileLoading ? "Saving..." : "Save & Continue"}
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={createProfileLoading}
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
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4377d8ff',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#1a202c',
    },
    uploadText: {
        color: '#4377d8ff',
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subLabel: {
        fontSize: 12,
        color: '#a0aec0',
        marginBottom: 10,
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
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    chip: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: 10,
    },
    chipSelected: {
        backgroundColor: '#4377d8ff',
        borderColor: '#4377d8ff',
    },
    chipText: {
        color: '#a0aec0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    chipTextSelected: {
        color: 'white',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    halfWidth: {
        width: '48%',
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
    saveButton: {
        marginTop: 10,
        marginBottom: 30,
    },
});

export default StudentProfileSetup;
