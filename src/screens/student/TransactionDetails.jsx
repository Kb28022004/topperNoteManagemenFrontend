import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../../components/AppText';
import { Theme } from '../../theme/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionDetails = ({ route, navigation }) => {
    const { transaction } = route.params;

    const DetailRow = ({ label, value, icon, color = "#94A3B8" }) => (
        <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
                <MaterialCommunityIcons name={icon} size={18} color={color} />
                <AppText style={styles.detailLabel}>{label}</AppText>
            </View>
            <AppText style={styles.detailValue} weight="medium">{value}</AppText>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle} weight="bold">Transaction Details</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status Card */}
                <LinearGradient
                    colors={transaction.status === 'SUCCESS' ? ['#065F46', '#064E3B'] : ['#991B1B', '#7F1D1D']}
                    style={styles.statusCard}
                >
                    <View style={styles.statusIconContainer}>
                        <MaterialCommunityIcons
                            name={transaction.status === 'SUCCESS' ? 'check-circle' : 'close-circle'}
                            size={48}
                            color="white"
                        />
                    </View>
                    <AppText style={styles.statusTitle} weight="bold">
                        Payment {transaction.status === 'SUCCESS' ? 'Successful' : 'Failed'}
                    </AppText>
                    <AppText style={styles.statusAmount} weight="bold">₹{transaction.amount}</AppText>
                    <AppText style={styles.statusDate}>
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </AppText>
                </LinearGradient>

                {/* Order Information */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">ORDER INFORMATION</AppText>
                    <View style={styles.card}>
                        <DetailRow
                            label="Note Title"
                            value={transaction.noteTitle}
                            icon="book-open-page-variant"
                            color="#3B82F6"
                        />
                        <DetailRow
                            label="Subject"
                            value={transaction.subject}
                            icon="book-outline"
                        />
                        <DetailRow
                            label="Chapter"
                            value={transaction.chapterName}
                            icon="file-document-outline"
                        />
                    </View>
                </View>

                {/* Payment Breakdown */}
                <View style={styles.section}>
                    <AppText style={styles.sectionTitle} weight="bold">PAYMENT DETAILS</AppText>
                    <View style={styles.card}>
                        <DetailRow
                            label="Order ID"
                            value={transaction.razorpayOrderId}
                            icon="identifier"
                        />
                        <DetailRow
                            label="Payment ID"
                            value={transaction.razorpayPaymentId}
                            icon="credit-card-outline"
                        />
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <AppText style={styles.totalLabel} weight="bold">Total Amount</AppText>
                            <AppText style={styles.totalValue} weight="bold">₹{transaction.amount}</AppText>
                        </View>
                    </View>
                </View>

                {/* Help Section */}
                <TouchableOpacity style={styles.helpBtn}>
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color="#94A3B8" />
                    <AppText style={styles.helpText}>Need help with this transaction?</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
    },
    scrollContent: {
        padding: 20,
    },
    statusCard: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 30,
    },
    statusIconContainer: {
        marginBottom: 15,
    },
    statusTitle: {
        color: 'white',
        fontSize: 20,
        marginBottom: 10,
    },
    statusAmount: {
        color: 'white',
        fontSize: 36,
        marginBottom: 10,
    },
    statusDate: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#64748B',
        fontSize: 12,
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    detailRow: {
        marginBottom: 18,
    },
    detailLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    detailLabel: {
        color: '#94A3B8',
        fontSize: 13,
    },
    detailValue: {
        color: 'white',
        fontSize: 15,
        marginLeft: 26,
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: 'white',
        fontSize: 16,
    },
    totalValue: {
        color: '#00B1FC',
        fontSize: 20,
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    helpText: {
        color: '#94A3B8',
        fontSize: 14,
    },
});

export default TransactionDetails;
