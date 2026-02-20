import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import AppText from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CustomAlert = ({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = false
}) => {

    // Type Config
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#10B981' };
            case 'error': return { name: 'alert-circle', color: '#EF4444' };
            case 'warning': return { name: 'warning', color: '#F59E0B' };
            default: return { name: 'information-circle', color: '#3B82F6' };
        }
    };

    const gradientColors = () => {
        switch (type) {
            case 'success': return ['#10B981', '#059669'];
            case 'error': return ['#EF4444', '#DC2626'];
            case 'warning': return ['#F59E0B', '#D97706'];
            default: return ['#3B82F6', '#2563EB'];
        }
    };

    const iconData = getIcon();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>

                    {/* Icon Header */}
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconData.name} size={48} color={iconData.color} />
                    </View>

                    {/* Content */}
                    <AppText style={styles.title} weight="bold">{title}</AppText>
                    <AppText style={styles.message}>{message}</AppText>

                    {/* Actions */}
                    <View style={styles.actions}>
                        {showCancel && (
                            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                                <AppText style={styles.cancelText}>{cancelText}</AppText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onConfirm || onClose}
                            style={[styles.confirmBtn, !showCancel && { width: '100%' }]}
                        >
                            <LinearGradient
                                colors={gradientColors()}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <AppText style={styles.confirmText} weight="bold">{confirmText}</AppText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    alertBox: {
        width: width * 0.85,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#334155'
    },
    iconContainer: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#0F172A',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#334155'
    },
    title: {
        color: 'white',
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center'
    },
    message: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmBtn: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden'
    },
    gradientBtn: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12 // Needed for old versions of RN
    },
    cancelText: {
        color: '#94A3B8',
        fontSize: 14
    },
    confirmText: {
        color: 'white',
        fontSize: 14
    }
});

export default CustomAlert;
