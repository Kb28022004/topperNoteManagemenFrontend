import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import AppText from './AppText';

/**
 * Reusable FormField component
 *
 * Props:
 *   label        — field label text
 *   required     — shows red * and red border when submitted & empty
 *   error        — error string to show below input (drives red border)
 *   children     — if provided, renders custom input (Dropdown, chips, etc.)
 *                  otherwise renders a built-in TextInput
 *   inputStyle   — extra style for the TextInput
 *   ...rest      — all TextInput props are forwarded
 */
const FormField = ({
    label,
    required = false,
    error = null,
    children,
    inputStyle,
    style,
    ...rest
}) => {
    const hasError = !!error;

    return (
        <View style={[styles.wrapper, style]}>
            {/* Label Row */}
            {label ? (
                <View style={styles.labelRow}>
                    <AppText style={styles.label}>{label}</AppText>
                    {required && <AppText style={styles.required}> *</AppText>}
                </View>
            ) : null}

            {/* Input — custom children OR built-in TextInput */}
            {children ? (
                <View style={[styles.childWrapper, hasError && styles.errorBorder]}>
                    {children}
                </View>
            ) : (
                <TextInput
                    style={[
                        styles.input,
                        hasError && styles.inputError,
                        inputStyle,
                    ]}
                    placeholderTextColor="#64748B"
                    {...rest}
                />
            )}

            {/* Error message */}
            {hasError && (
                <View style={styles.errorRow}>
                    <AppText style={styles.errorText}>{error}</AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    required: {
        fontSize: 15,
        color: '#EF4444',
        fontWeight: '700',
        lineHeight: 18,
    },
    input: {
        backgroundColor: 'rgba(58, 60, 63, 0.5)',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 15,
        color: 'white',
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
        backgroundColor: 'rgba(239, 68, 68, 0.07)',
    },
    // For wrapping non-TextInput children (Dropdown, chips) with error border
    childWrapper: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    errorBorder: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
    },
});

export default FormField;
