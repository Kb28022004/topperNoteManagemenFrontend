import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, Keyboard, TouchableOpacity } from 'react-native';

const OtpInput = ({ length = 4, value, onChange, error }) => {
    const inputRefs = useRef([]);

    const handleChange = (text, index) => {
        if (!/^\d*$/.test(text)) return;

        const otpArray = (value || '').split('');
        otpArray[index] = text;
        const newOtp = otpArray.join('');
        onChange(newOtp);

        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!value[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();

                const otpArray = (value || '').split('');
                otpArray[index - 1] = '';
                onChange(otpArray.join(''));
            }
        }
    };

    return (
        <View style={styles.container}>
            {Array(length).fill(0).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                        styles.input,
                        error ? styles.inputError : (value[index] ? styles.inputFilled : null),
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={value[index] || ''}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    placeholder="-"
                    placeholderTextColor="#4a5568"
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
        width: '100%',
    },
    input: {
        flex: 1,
        height: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    inputFilled: {
        borderColor: '#4377d8ff', 
        backgroundColor: 'rgba(67, 119, 216, 0.1)',
    },
    inputError: {
        borderColor: '#ff444496',
    },
});

export default OtpInput;
