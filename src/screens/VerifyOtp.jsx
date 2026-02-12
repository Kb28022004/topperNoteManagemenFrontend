import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stepper from "../components/Stepper";
import AppText from '../components/AppText';
import ReusableButton from '../components/ReausableButton';
import Loader from '../components/Loader';
import OtpInput from '../components/OtpInput';
import TermsAndPrivacy from '../components/TermsAndPrivacy';
import Header from '../components/Header';

import { useVerifyOtpMutation } from '../features/api/authApi';
import useApiFeedback from '../hooks/useApiFeedback';

const VerifyOtp = ({ navigation, route }) => {
    const phoneNumber = route.params?.phoneNumber || '';
    const { role } = route.params || {};

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(true); // Initial page load

    const [verifyOtp, { isLoading: isVerifying, isSuccess, data, isError, error: verifyError }] = useVerifyOtpMutation();

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(initialTimer);
    }, []);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const handleSuccess = React.useCallback(async (responseData) => {
        // Handle nested data structure { success: true, data: { token, user } }
        const result = responseData?.data || responseData;

        if (result?.token) {
            await AsyncStorage.setItem('token', result.token);
            await AsyncStorage.setItem('user', JSON.stringify(result.user));

            // Log for debugging
            console.log("Token saved successfully:", result.token);
        }

        if (result?.user?.profileCompleted) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } else {
            // Check role and navigate
            if (result?.user?.role === 'TOPPER') {
                navigation.navigate('TopperProfileSetup');
            } else {
                navigation.navigate('StudentProfileSetup');
            }
        }
    }, [navigation]);

    useApiFeedback(
        isSuccess,
        data,
        isError,
        verifyError,
        handleSuccess
    );

    const handleVerifyOtp = () => {
        Keyboard.dismiss();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }
        setError('');
        verifyOtp({ phone: phoneNumber, otp }).unwrap();
    };

    const handleResendOtp = () => {
        if (timer > 0) return;
        // Logic to resend OTP
        // Ideally call sendOtp again or navigate back
        navigation.goBack();
    };

    return (
        <View style={styles.mainContainer}>
            <Loader visible={isLoading} />
            <View style={styles.container}>
                <Header title="Verification" />

                <Stepper currentStep={2} totalSteps={3} />

                <View style={styles.contentContainer}>
                    <AppText style={styles.title}>Enter the code</AppText>
                    <AppText style={styles.subtitle}>
                        Sent to <AppText weight="bold" style={{ color: 'white' }}>+91 {phoneNumber}</AppText>
                    </AppText>

                    <OtpInput
                        length={6}
                        value={otp}
                        onChange={(code) => {
                            setOtp(code);
                            if (error) setError('');
                        }}
                        error={!!error}
                    />

                    {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

                    <View style={styles.resendContainer}>
                        <AppText style={styles.resendText}>Didn't receive code? </AppText>
                        <TouchableOpacity onPress={handleResendOtp} disabled={timer > 0}>
                            <AppText
                                style={[
                                    styles.resendLink,
                                    timer > 0 ? styles.resendDisabled : null
                                ]}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    <ReusableButton
                        title={isVerifying ? "Verifying..." : "Verify & Continue"}
                        onPress={handleVerifyOtp}
                        style={styles.button}
                        disabled={isVerifying}
                    />
                </View>
            </View>

            <TermsAndPrivacy />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 55,
    },
    contentContainer: {
        marginTop: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#a0aec0',
        marginBottom: 40,
        lineHeight: 22,
    },
    errorText: {
        color: '#ff444496',
        fontSize: 12,
        marginBottom: 15,
        textAlign: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    resendText: {
        color: '#a0aec0',
        fontSize: 14,
    },
    resendLink: {
        color: '#4377d8ff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    resendDisabled: {
        color: '#4a5568',
    },
    button: {
        marginTop: 10,
    },
});

export default VerifyOtp;
