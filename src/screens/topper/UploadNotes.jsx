import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import CustomDropdown from '../../components/CustomDropdown';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import { useUploadNoteMutation } from '../../features/api/noteApi';
import useApiFeedback from '../../hooks/useApiFeedback';

const CLASSES = ['10', '12'];
const BOARDS = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'State Board', value: 'STATE' }
];
const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'Accountancy', 'Economics', 'History', 'Geography'];

const UploadNotes = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [details, setDetails] = useState({
        subject: '',
        class: '',
        chapterName: '',
        board: '',
        price: ''
    });
    const [uploadNote, { isLoading: uploadLoading, isError, error, isSuccess, data }] = useUploadNoteMutation();

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
        () => navigation.goBack(),
        "Notes submitted for review!"
    );

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
                setCurrentStep(2);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleContinue = () => {
        if (currentStep === 2) {
            if (!details.subject || !details.class || !details.chapterName || !details.board) {
                Alert.alert('Error', 'Please fill all details');
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleSubmit = async () => {
        if (!details.price) {
            Alert.alert('Error', 'Please set a price');
            return;
        }

        const formData = new FormData();
        formData.append('subject', details.subject);
        formData.append('class', details.class);
        formData.append('chapterName', details.chapterName);
        formData.append('board', details.board);
        formData.append('price', details.price);

        if (file) {
            formData.append('pdf', {
                uri: file.uri,
                name: file.name,
                type: 'application/pdf',
            });
        }

        try {
            await uploadNote(formData).unwrap();
        } catch (err) {
            console.log("Upload Error:", err);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <AppText style={styles.stepTitle}>Upload your PDF</AppText>
            <AppText style={styles.stepSubtitle}>Handwritten or digital notes are both welcome.</AppText>

            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="file-pdf-box" size={40} color="#00B1FC" />
                </View>
                <AppText style={styles.uploadText} weight="bold">Tap to choose PDF</AppText>
                <AppText style={styles.uploadSubtext}>Max 20MB • PDF format only</AppText>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>1. Uploaded File</AppText>
                <TouchableOpacity onPress={() => setCurrentStep(1)}>
                    <AppText style={styles.editBtn}>Edit</AppText>
                </TouchableOpacity>
            </View>

            <View style={styles.fileCard}>
                <View style={styles.fileIconBox}>
                    <MaterialCommunityIcons name="file-pdf-box" size={30} color="#EF4444" />
                </View>
                <View style={styles.fileInfo}>
                    <AppText style={styles.fileName} numberOfLines={1}>{file?.name}</AppText>
                    <AppText style={styles.fileSize}>{(file?.size / (1024 * 1024)).toFixed(1)} MB • PDF</AppText>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>

            <AppText style={[styles.sectionTitle, { marginTop: 20 }]}>2. Details</AppText>

            <View style={styles.rowBetween}>
                <View style={styles.halfWidth}>
                    <AppText style={styles.label}>Subject</AppText>
                    <CustomDropdown
                        options={SUBJECTS}
                        selectedValue={details.subject}
                        onSelect={(val) => setDetails({ ...details, subject: val })}
                        placeholder="Select"
                    />
                </View>
                <View style={styles.halfWidth}>
                    <AppText style={styles.label}>Class</AppText>
                    <CustomDropdown
                        options={CLASSES}
                        selectedValue={details.class}
                        onSelect={(val) => setDetails({ ...details, class: val })}
                        placeholder="Select"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <AppText style={styles.label}>Chapter Name</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Electrostatics & Fields"
                    placeholderTextColor="#64748B"
                    value={details.chapterName}
                    onChangeText={(val) => setDetails({ ...details, chapterName: val })}
                />
            </View>

            <View style={styles.formGroup}>
                <AppText style={styles.label}>Board</AppText>
                <CustomDropdown
                    options={BOARDS}
                    selectedValue={details.board}
                    onSelect={(val) => setDetails({ ...details, board: val })}
                    placeholder="Select Board"
                />
            </View>

            <ReusableButton title="Next" onPress={handleContinue} style={{ marginTop: 20 }} />
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            {/* Summary of Step 1 & 2 */}
            <View style={styles.summaryCard}>
                <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
                    <AppText style={styles.fileNameSmall}>{file?.name}</AppText>
                    <TouchableOpacity onPress={() => setCurrentStep(1)}>
                        <AppText style={styles.editBtn}>Edit</AppText>
                    </TouchableOpacity>
                </View>
                <AppText style={styles.summaryDetails}>Class {details.class} • {details.subject}</AppText>
                <AppText style={styles.summaryDetails}>{details.board}</AppText>
            </View>

            <AppText style={styles.sectionTitleLarge}>Set your price</AppText>
            <AppText style={styles.priceDescription}>
                Choose a fair price for your notes. Higher prices may reduce sales volume.
            </AppText>

            <View style={styles.priceInputWrapper}>
                <AppText style={styles.currency}>₹</AppText>
                <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#64748B"
                    value={details.price}
                    onChangeText={(val) => setDetails({ ...details, price: val })}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep(2)}>
                    <AppText style={styles.backText}>Back</AppText>
                </TouchableOpacity>
                <TouchableOpacity disabled={uploadLoading} style={styles.submitBtn} onPress={handleSubmit}>
                    <AppText style={styles.submitText}>{uploadLoading ? "Submitting..." : "Submit for Review"}</AppText>
                    <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Loader visible={isLoading } />
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Upload Notes</AppText>
                <TouchableOpacity>
                    <AppText style={styles.helpBtn}>Help</AppText>
                </TouchableOpacity>
            </View>

            {/* Stepper UI */}
            <View style={styles.stepperWrapper}>
                <View style={styles.stepperHeader}>
                    <AppText style={styles.stepCount}>Step {currentStep} of 3</AppText>
                    <AppText style={styles.stepModule}>{currentStep === 3 ? 'Pricing' : currentStep === 2 ? 'Details' : 'Select File'}</AppText>
                </View>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(currentStep / 3) * 100}%` }]} />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    helpBtn: {
        color: '#94A3B8',
        fontSize: 14,
    },
    stepperWrapper: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    stepperHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    stepCount: {
        fontSize: 12,
        color: '#00B1FC',
    },
    stepModule: {
        fontSize: 12,
        color: '#94A3B8',
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#1E293B',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#00B1FC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        color: 'white',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 30,
    },
    uploadBox: {
        height: 250,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#334155',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 177, 252, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadText: {
        fontSize: 18,
        color: 'white',
        marginBottom: 8,
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#64748B',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    editBtn: {
        color: '#00B1FC',
        fontSize: 14,
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    fileIconBox: {
        width: 45,
        height: 55,
        backgroundColor: '#2D3748',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        color: 'white',
        fontSize: 14,
        marginBottom: 4,
    },
    fileSize: {
        color: '#94A3B8',
        fontSize: 12,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    halfWidth: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 10,
    },
    formGroup: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    summaryCard: {
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#334155',
    },
    fileNameSmall: {
        color: 'white',
        fontSize: 14,
        flex: 1,
    },
    summaryDetails: {
        color: '#94A3B8',
        fontSize: 13,
        marginTop: 4,
    },
    sectionTitleLarge: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    priceDescription: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 22,
        marginBottom: 30,
    },
    priceInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 80,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 40,
    },
    currency: {
        fontSize: 32,
        color: 'white',
        marginRight: 10,
    },
    priceInput: {
        flex: 1,
        fontSize: 32,
        color: '#00B1FC',
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        gap: 15,
    },
    backBtn: {
        flex: 1,
        height: 60,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    backText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitBtn: {
        flex: 2,
        height: 60,
        backgroundColor: '#00B1FC',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default UploadNotes;
