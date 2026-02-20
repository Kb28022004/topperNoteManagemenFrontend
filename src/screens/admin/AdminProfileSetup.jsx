import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import AppText from '../../components/AppText';
import ReusableButton from '../../components/ReausableButton';
import { Ionicons } from "@expo/vector-icons";
import { useCreateProfileMutation } from '../../features/api/adminApi';
import useApiFeedback from '../../hooks/useApiFeedback';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';

const AdminProfileSetup = ({ navigation }) => {
    // Form State
    const { showAlert } = useAlert();
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [createProfile, { isLoading: isCreating, isSuccess, data, isError, error }] = useCreateProfileMutation();

    // Initial Loading Simulation
    useEffect(() => {
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
        () => navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
        }),
        "Admin Profile saved successfully!"
    );

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

    const handleSave = async () => {
        if (!fullName.trim()) {
            showAlert("Error", "Full Name is required", "error");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", fullName);
        if (bio) formData.append("bio", bio);
        if (department) formData.append("department", department);
        if (designation) formData.append("designation", designation);

        if (image) {
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append("profilePhoto", { uri: image, name: filename, type });
        }

        try {
            await createProfile(formData).unwrap();
        } catch (err) {
            console.log("Admin Profile Error:", err);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <Loader visible={isLoading} />
            <View style={styles.container}>
                <Header title="Setup Admin Profile" />
                <AppText style={styles.subTitleHeader}>Manage your notes and earnings.</AppText>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Photo */}
                    <View style={styles.profileSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            <Image
                                source={image ? { uri: image } : require('../../../assets/admin.avif')}
                                style={styles.avatar} // Placeholder needed if not available
                            />
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={14} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Full Name */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Full Name</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Full Name"
                            placeholderTextColor="#666"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Short Bio</AppText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={3}
                            value={bio}
                            onChangeText={setBio}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Department */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Department (Optional)</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Content Team"
                            placeholderTextColor="#666"
                            value={department}
                            onChangeText={setDepartment}
                        />
                    </View>


                    {/* Designation */}
                    <View style={styles.formGroup}>
                        <AppText style={styles.label}>Designation (Optional)</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Senior Editor"
                            placeholderTextColor="#666"
                            value={designation}
                            onChangeText={setDesignation}
                        />
                    </View>

                    <ReusableButton
                        title={isCreating ? "Saving..." : "Save Profile"}
                        onPress={handleSave}
                        icon="save"
                        style={styles.saveButton}
                        disabled={isCreating}
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
        marginTop: -10,
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
        backgroundColor: '#2d3748',
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
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 8,
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
    saveButton: {
        marginTop: 10,
        marginBottom: 30,
        backgroundColor: '#4299e1',
    },
});

export default AdminProfileSetup;
