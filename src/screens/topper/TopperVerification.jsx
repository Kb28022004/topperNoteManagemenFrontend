import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import Stepper from '../../components/Stepper';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../../components/CustomDropdown';
import { useSubmitVerificationMutation, useGetProfileQuery } from '../../features/api/topperApi';
import useApiFeedback from '../../hooks/useApiFeedback';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';

const SUBJECTS_MAP = {
    '12': {
        'SCIENCE': ['Physics', 'Chemistry', 'Maths'],
        'COMMERCE': ['Accountancy', 'Business Studies', 'Economics'],
        'ARTS': ['History', 'Political Science', 'Geography'],
    },
    '10': ['Maths', 'Science', 'English', 'Social Studies', 'Hindi']
};

const TopperVerification = ({ navigation }) => {
    const { showAlert } = useAlert();
    const [marksheet, setMarksheet] = useState(null);
    const [yearOfPassing, setYearOfPassing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();

    // Subject Marks State
    const [subjectMarks, setSubjectMarks] = useState([]);

    useEffect(() => {
        if (profileData?.data) {
            const { expertiseClass, stream, coreSubjects } = profileData.data;
            let initialSubjects = [];

            if (coreSubjects && coreSubjects.length > 0) {
                initialSubjects = coreSubjects.map(sub => ({ subject: sub, marks: '' }));
            } else if (expertiseClass === '12' && stream && SUBJECTS_MAP['12'][stream]) {
                initialSubjects = SUBJECTS_MAP['12'][stream].map(sub => ({ subject: sub, marks: '' }));
            } else if (expertiseClass === '10') {
                initialSubjects = SUBJECTS_MAP['10'].map(sub => ({ subject: sub, marks: '' }));
            } else {
                // Default if something goes wrong
                initialSubjects = [
                    { subject: 'Physics', marks: '' },
                    { subject: 'Chemistry', marks: '' },
                    { subject: 'Maths', marks: '' },
                ];
            }
            setSubjectMarks(initialSubjects);
        }
    }, [profileData]);

    // Generate years (e.g., 2024 down to 2010)
    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 15 }, (_, i) => (currentYear - i).toString());

    // Custom Hook for initial loading
    useEffect(() => {
        if (!isProfileLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isProfileLoading]);

    const [submitVerification, { isLoading: isSubmitting, isSuccess, data, isError, error }] = useSubmitVerificationMutation();

    useApiFeedback(
        isSuccess,
        data,
        isError,
        error,
        () => navigation.reset({
            index: 0,
            routes: [{ name: 'TopperApprovalPending' }],
        }),
        "Verification submitted successfully!"
    );

    const pickMarksheet = async () => {
        Alert.alert(
            "Upload Marksheet",
            "Choose a source",
            [
                {
                    text: "Gallery",
                    onPress: async () => {
                        try {
                            let result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: "Images",
                                quality: 1,
                            });
                            if (!result.canceled) {
                                setMarksheet(result.assets[0]);
                            }
                        } catch (e) {
                            showAlert("Error", "Failed to pick image", "error");
                        }
                    }
                },
                {
                    text: "Document",
                    onPress: async () => {
                        try {
                            let result = await DocumentPicker.getDocumentAsync({
                                type: ['image/*', 'application/pdf'],
                                copyToCacheDirectory: true
                            });
                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                setMarksheet(result.assets[0]);
                            }
                        } catch (e) {
                            showAlert("Error", "Failed to pick document", "error");
                        }
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleSubjectChange = (text, index, field) => {
        const newMarks = [...subjectMarks];
        newMarks[index][field] = text;
        setSubjectMarks(newMarks);
    };

    const addSubjectRow = () => {
        setSubjectMarks([...subjectMarks, { subject: '', marks: '' }]);
    };

    const removeSubjectRow = (index) => {
        const newMarks = subjectMarks.filter((_, i) => i !== index);
        setSubjectMarks(newMarks);
    };

    const handleSubmit = async () => {
        if (!marksheet) {
            showAlert("Error", "Please upload your marksheet", "error");
            return;
        }
        if (!yearOfPassing) {
            showAlert("Error", "Please select passing year", "error");
            return;
        }

        // Validate subjects
        if (subjectMarks.length === 0) {
            showAlert("Error", "Please add at least one subject", "error");
            return;
        }

        for (const item of subjectMarks) {
            if (!item.subject.trim()) {
                showAlert("Error", "All subject names must be filled", "error");
                return;
            }
            if (!item.marks.trim()) {
                showAlert("Error", `Please enter marks for ${item.subject}`, "error");
                return;
            }
            const num = Number(item.marks);
            if (isNaN(num) || num < 0 || num > 100) {
                showAlert("Error", `Marks for ${item.subject} must be between 0 and 100`, "error");
                return;
            }
        }

        const formData = new FormData();
        formData.append("yearOfPassing", yearOfPassing);

        // Serialize all valid subjectMarks as JSON string
        formData.append("subjectMarks", JSON.stringify(subjectMarks));

        // Append file
        const uri = marksheet.uri;
        const name = marksheet.name || marksheet.fileName || 'marksheet.jpg';
        const type = marksheet.mimeType || 'image/jpeg';

        formData.append("marksheet", { uri, name, type });

        try {
            await submitVerification(formData).unwrap();
        } catch (err) {
            console.log("Verification Submission Error:", err);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Loader visible={isLoading} />
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Header title="" backButtonOnly={true} />
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <AppText style={styles.skipText}>Skip</AppText>
                    </TouchableOpacity>
                </View>

                <AppText style={styles.headerTitle}>Verify Academic Details</AppText>
                <AppText style={styles.headerSubtitle}>Please upload proof of your academic achievements.</AppText>

                <View style={styles.warningContainer}>
                    <Ionicons name="eye-off" size={16} color="#ed8936" />
                    <AppText style={styles.warningText}>Blur sensitive info like address & phone number.</AppText>
                </View>

                <Stepper currentStep={2} totalSteps={2} />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Upload Section */}
                    <AppText style={styles.sectionLabel}>
                        <Ionicons name="cloud-upload" size={14} color="#63b3ed" /> Upload Marksheet
                    </AppText>

                    <TouchableOpacity style={styles.uploadBox} onPress={pickMarksheet}>
                        {marksheet ? (
                            <View style={styles.filePreview}>
                                <Ionicons name="document-text" size={30} color="#63b3ed" />
                                <AppText style={styles.fileName}>{marksheet.name || 'Selected File'}</AppText>
                                <Ionicons name="checkmark-circle" size={20} color="#48bb78" />
                            </View>
                        ) : (
                            <>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="camera" size={24} color="#a0aec0" />
                                </View>
                                <AppText style={styles.uploadLink}>Tap to upload photo</AppText>
                                <AppText style={styles.uploadHint}>JPG, PNG or PDF (Max 5MB)</AppText>
                            </>
                        )}
                    </TouchableOpacity>


                    {/* Year of Passing */}
                    <AppText style={styles.sectionLabel}>
                        <Ionicons name="calendar" size={14} color="#63b3ed" /> Year of Passing
                    </AppText>
                    <CustomDropdown
                        options={YEARS}
                        selectedValue={yearOfPassing}
                        onSelect={setYearOfPassing}
                        placeholder="Select Year"
                    />


                    {/* Subject Marks */}
                    <View style={styles.flexRowBetween}>
                        <AppText style={styles.sectionLabel}>
                            <Ionicons name="stats-chart" size={14} color="#63b3ed" /> Subject Marks
                        </AppText>
                        <AppText style={styles.hintText}>Add main subjects</AppText>
                    </View>

                    {subjectMarks.map((item, index) => (
                        <View key={index} style={styles.marksRow}>
                            {/* Subject Icon Circle */}
                            <View style={styles.subjectIcon}>
                                <AppText style={{ color: '#a0aec0', fontSize: 10, fontWeight: 'bold' }}>
                                    {item.subject ? item.subject.substring(0, 2).toUpperCase() : '??'}
                                </AppText>
                            </View>

                            <View style={styles.inputsContainer}>
                                <TextInput
                                    style={styles.subjectInput}
                                    placeholder="Subject"
                                    placeholderTextColor="#666"
                                    value={item.subject}
                                    onChangeText={(text) => handleSubjectChange(text, index, 'subject')}
                                />
                                <View style={styles.divider} />
                                <TextInput
                                    style={styles.marksInput}
                                    placeholder="Marks"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    value={item.marks}
                                    onChangeText={(text) => handleSubjectChange(text, index, 'marks')}
                                    maxLength={3}
                                />
                                <AppText style={styles.totalText}>/100</AppText>
                            </View>

                            <TouchableOpacity onPress={() => removeSubjectRow(index)} style={styles.closeButton}>
                                <Ionicons name="close" size={16} color="#a0aec0" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add Button */}
                    <View style={styles.addRowContainer}>
                        <View style={styles.inputsContainerDisabled}>
                            <AppText style={{ color: '#666', paddingLeft: 10 }}>Subject Name</AppText>
                            <View style={{ flex: 1 }} />
                            <AppText style={{ color: '#666' }}>Marks</AppText>
                            <AppText style={styles.totalText}>/100</AppText>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={addSubjectRow}>
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ReusableButton
                        title={isSubmitting ? "Submitting..." : "Submit for Verification"}
                        onPress={handleSubmit}
                        icon="checkmark-circle"
                        style={styles.submitButton}
                        disabled={isSubmitting}
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    skipText: {
        color: '#4299e1',
        fontWeight: 'bold',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    headerSubtitle: {
        color: '#a0aec0',
        fontSize: 14,
        marginBottom: 10,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    warningText: {
        color: '#ed8936',
        fontSize: 12,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingTop: 10,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 10,
        marginTop: 20,
    },
    uploadBox: {
        borderWidth: 1,
        borderColor: '#4a5568',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(45, 55, 72, 0.3)',
    },
    iconCircle: {
        backgroundColor: '#2d3748',
        padding: 10,
        borderRadius: 25,
        marginBottom: 10,
    },
    uploadLink: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    uploadHint: {
        color: '#718096',
        fontSize: 12,
        marginTop: 5,
    },
    filePreview: {
        alignItems: 'center',
        gap: 5
    },
    fileName: {
        color: 'white',
        fontSize: 14
    },
    flexRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: 10,
    },
    hintText: {
        color: '#718096',
        fontSize: 12,
    },
    marksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(58, 60, 63, 0.3)',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#2d3748',
        gap: 10,
    },
    subjectIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2d3748',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectInput: {
        flex: 2,
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#4a5568',
        marginHorizontal: 10,
    },
    marksInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    totalText: {
        color: '#718096',
        fontSize: 12,
        marginLeft: 2,
    },
    closeButton: {
        padding: 5,
    },
    addRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 5,
    },
    inputsContainerDisabled: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(58, 60, 63, 0.15)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
        height: 50,
    },
    addButton: {
        width: 50,
        height: 50,
        backgroundColor: '#4299e1',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        marginTop: 30,
        marginBottom: 50,
        backgroundColor: '#4299e1',
    },
});

export default TopperVerification;
