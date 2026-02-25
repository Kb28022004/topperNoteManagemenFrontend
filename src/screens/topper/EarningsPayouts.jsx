import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TextInput,
    Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/AppText';
import {
    useGetEarningsSummaryQuery,
    useGetTransactionsQuery,
    useGetPayoutHistoryQuery,
    useRequestPayoutMutation,
    useUpdatePayoutSettingsMutation
} from '../../features/api/topperApi';
import { useAlert } from '../../context/AlertContext';
import Loader from '../../components/Loader';
import NoDataFound from '../../components/NoDataFound';

const EarningsPayouts = ({ navigation }) => {
    const { showAlert } = useAlert();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'transactions', 'payouts'
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Settings state
    const [payoutMethod, setPayoutMethod] = useState('UPI');
    const [upiId, setUpiId] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
    });

    const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useGetEarningsSummaryQuery();
    const { data: transactionsData, isFetching: transactionsFetching, refetch: refetchTransactions } = useGetTransactionsQuery({ page: 1, limit: 50 }, { skip: activeTab !== 'transactions' });
    const { data: payoutsData, isFetching: payoutsFetching, refetch: refetchPayouts } = useGetPayoutHistoryQuery({ page: 1, limit: 50 }, { skip: activeTab !== 'payouts' });

    const [requestPayout, { isLoading: isRequesting }] = useRequestPayoutMutation();
    const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdatePayoutSettingsMutation();

    const stats = summaryData?.data?.summary || {};

    const onRefresh = useCallback(async () => {
        if (activeTab === 'summary') await refetchSummary();
        if (activeTab === 'transactions') await refetchTransactions();
        if (activeTab === 'payouts') await refetchPayouts();
    }, [activeTab]);

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(withdrawAmount)) {
            showAlert("Error", "Please enter a valid amount", "error");
            return;
        }
        if (parseFloat(withdrawAmount) < 100) {
            showAlert("Error", "Minimum withdrawal amount is ₹100", "error");
            return;
        }
        if (parseFloat(withdrawAmount) > stats.availableBalance) {
            showAlert("Error", "Insufficient balance", "error");
            return;
        }

        try {
            await requestPayout({ amount: parseFloat(withdrawAmount) }).unwrap();
            showAlert("Success", "Withdrawal request submitted successfully", "success");
            setShowWithdrawModal(false);
            setWithdrawAmount('');
        } catch (err) {
            showAlert("Error", err?.data?.message || "Failed to submit request", "error");
        }
    };

    const handleSaveSettings = async () => {
        if (payoutMethod === 'UPI' && !upiId) {
            showAlert("Error", "Please enter UPI ID", "error");
            return;
        }
        if (payoutMethod === 'BANK' && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
            showAlert("Error", "Please enter bank details", "error");
            return;
        }

        try {
            await updateSettings({
                method: payoutMethod,
                upiId: payoutMethod === 'UPI' ? upiId : undefined,
                bankDetails: payoutMethod === 'BANK' ? bankDetails : undefined,
            }).unwrap();
            showAlert("Success", "Payout settings updated successfully", "success");
            setShowSettingsModal(false);
        } catch (err) {
            showAlert("Error", "Failed to update settings", "error");
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'PAID': { bg: '#10B98120', text: '#10B981' },
            'PENDING': { bg: '#F59E0B20', text: '#F59E0B' },
            'REJECTED': { bg: '#EF444420', text: '#EF4444' },
            'SUCCESS': { bg: '#10B98120', text: '#10B981' },
        };
        const config = colors[status] || { bg: '#64748B20', text: '#64748B' };
        return (
            <View style={[styles.badge, { backgroundColor: config.bg }]}>
                <AppText style={[styles.badgeText, { color: config.text }]} weight="bold">{status}</AppText>
            </View>
        );
    };

    const renderSummary = () => (
        <View style={styles.tabContent}>
            {/* Earnings Cards */}
            <View style={styles.statsGrid}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.mainStatCard}>
                    <View style={styles.statInfo}>
                        <AppText style={styles.mainStatLabel}>Available Balance</AppText>
                        <AppText style={styles.mainStatValue} weight="bold">₹{stats.availableBalance || 0}</AppText>
                    </View>
                    <TouchableOpacity
                        style={styles.withdrawMainBtn}
                        onPress={() => setShowWithdrawModal(true)}
                    >
                        <AppText style={styles.withdrawBtnText} weight="bold">Withdraw Now</AppText>
                    </TouchableOpacity>
                </LinearGradient>

                <View style={styles.subStatsRow}>
                    <View style={styles.subStatCard}>
                        <AppText style={styles.subStatLabel}>Total Earned</AppText>
                        <AppText style={styles.subStatValue} weight="bold">₹{stats.totalEarned || 0}</AppText>
                    </View>
                    <View style={styles.subStatCard}>
                        <AppText style={styles.subStatLabel}>This Month</AppText>
                        <AppText style={styles.subStatValue} weight="bold">₹{stats.thisMonthEarnings || 0}</AppText>
                    </View>
                </View>

                <View style={styles.subStatsRow}>
                    <View style={styles.subStatCard}>
                        <AppText style={styles.subStatLabel}>Withdrawn</AppText>
                        <AppText style={styles.subStatValue} weight="bold">₹{stats.paidAmount || 0}</AppText>
                    </View>
                    <View style={styles.subStatCard}>
                        <AppText style={styles.subStatLabel}>Pending</AppText>
                        <AppText style={styles.subStatValue} weight="bold">₹{stats.pendingAmount || 0}</AppText>
                    </View>
                </View>
            </View>

            {/* Payout Settings Link */}
            <TouchableOpacity
                style={styles.settingsCard}
                onPress={() => setShowSettingsModal(true)}
            >
                <View style={styles.settingsIconBox}>
                    <Ionicons name="card-outline" size={24} color="#00B1FC" />
                </View>
                <View style={styles.settingsInfo}>
                    <AppText style={styles.settingsTitle} weight="bold">Payout Settings</AppText>
                    <AppText style={styles.settingsSub}>Manage UPI or Bank Account</AppText>
                </View>
                <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Platform Policy */}
            <View style={styles.policyCard}>
                <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
                <AppText style={styles.policyText}>Payouts are processed within 2-3 business days. Minimum withdrawal amount is ₹100.</AppText>
            </View>
        </View>
    );

    const renderTransactions = () => (
        <View style={styles.tabContent}>
            {transactionsData?.data?.transactions?.length > 0 ? (
                transactionsData.data.transactions.map((item, index) => (
                    <View key={index} style={styles.transactionCard}>
                        <View style={styles.transHeader}>
                            <View style={styles.transIconBox}>
                                <Feather name="arrow-down-left" size={20} color="#10B981" />
                            </View>
                            <View style={styles.transInfo}>
                                <AppText style={styles.transTitle} weight="bold">{item.noteId?.subject || 'Note Sale'}</AppText>
                                <AppText style={styles.transDate}>{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</AppText>
                            </View>
                            <AppText style={styles.transAmount} weight="bold">+₹{item.amountPaid}</AppText>
                        </View>
                        <View style={styles.transFooter}>
                            <AppText style={styles.transBuyer}>Student: {item.studentId?.fullName || 'N/A'}</AppText>
                            <StatusBadge status="SUCCESS" />
                        </View>
                    </View>
                ))
            ) : (
                <NoDataFound message="No transactions recorded yet" icon="swap-horizontal-outline" />
            )}
        </View>
    );

    const renderPayouts = () => (
        <View style={styles.tabContent}>
            {payoutsData?.data?.payouts?.length > 0 ? (
                payoutsData.data.payouts.map((item, index) => (
                    <View key={index} style={styles.transactionCard}>
                        <View style={styles.transHeader}>
                            <View style={[styles.transIconBox, { backgroundColor: '#F43F5E15' }]}>
                                <Feather name="arrow-up-right" size={20} color="#F43F5E" />
                            </View>
                            <View style={styles.transInfo}>
                                <AppText style={styles.transTitle} weight="bold">Withdrawal Request</AppText>
                                <AppText style={styles.transDate}>{new Date(item.createdAt).toLocaleDateString()}</AppText>
                            </View>
                            <AppText style={[styles.transAmount, { color: '#F43F5E' }]} weight="bold">-₹{item.amount}</AppText>
                        </View>
                        <View style={styles.transFooter}>
                            <AppText style={styles.transBuyer}>Method: {item.paymentMethod} {item.transactionId ? `• ID: ${item.transactionId}` : ''}</AppText>
                            <StatusBadge status={item.status} />
                        </View>
                        {item.adminRemarks && (
                            <View style={styles.remarksContainer}>
                                <AppText style={styles.remarksText}>Note: {item.adminRemarks}</AppText>
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <NoDataFound message="No payout history found" icon="cash-outline" />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.header}>
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <AppText style={styles.headerTitle} weight="bold">Earnings & Payouts</AppText>
                    <TouchableOpacity style={styles.helpBtn}>
                        <Ionicons name="help-circle-outline" size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabsRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
                        onPress={() => setActiveTab('summary')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>Summary</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
                        onPress={() => setActiveTab('transactions')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>Sales</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'payouts' && styles.activeTab]}
                        onPress={() => setActiveTab('payouts')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'payouts' && styles.activeTabText]}>Payouts</AppText>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#00B1FC" />}
                contentContainerStyle={styles.scrollContent}
            >
                {summaryLoading ? (
                    <ActivityIndicator size="large" color="#00B1FC" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {activeTab === 'summary' && renderSummary()}
                        {activeTab === 'transactions' && renderTransactions()}
                        {activeTab === 'payouts' && renderPayouts()}
                    </>
                )}
            </ScrollView>

            {/* Withdraw Modal */}
            <Modal
                visible={showWithdrawModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowWithdrawModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle} weight="bold">Withdraw Funds</AppText>
                            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.availableBox}>
                            <AppText style={styles.availableLabel}>Available for withdrawal</AppText>
                            <AppText style={styles.availableValue} weight="bold">₹{stats.availableBalance}</AppText>
                        </View>

                        <AppText style={styles.inputLabel}>Enter Amount (Min ₹100)</AppText>
                        <View style={styles.amountInputContainer}>
                            <AppText style={styles.currencyPrefix}>₹</AppText>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor="#475569"
                                keyboardType="numeric"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleWithdraw}
                            disabled={isRequesting}
                        >
                            {isRequesting ? <ActivityIndicator color="white" /> : <AppText style={styles.confirmBtnText} weight="bold">Submit Request</AppText>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Payout Settings Modal */}
            <Modal
                visible={showSettingsModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSettingsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle} weight="bold">Payout Settings</AppText>
                            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.methodToggle}>
                            <TouchableOpacity
                                style={[styles.methodBtn, payoutMethod === 'UPI' && styles.activeMethod]}
                                onPress={() => setPayoutMethod('UPI')}
                            >
                                <AppText style={[styles.methodText, payoutMethod === 'UPI' && styles.activeMethodText]}>UPI</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodBtn, payoutMethod === 'BANK' && styles.activeMethod]}
                                onPress={() => setPayoutMethod('BANK')}
                            >
                                <AppText style={[styles.methodText, payoutMethod === 'BANK' && styles.activeMethodText]}>Bank Account</AppText>
                            </TouchableOpacity>
                        </View>

                        {payoutMethod === 'UPI' ? (
                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>UPI ID (GPay, PhonePe, etc.)</AppText>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="yourname@upi"
                                    placeholderTextColor="#475569"
                                    value={upiId}
                                    onChangeText={setUpiId}
                                />
                            </View>
                        ) : (
                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>Account Holder Name</AppText>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="John Doe"
                                    placeholderTextColor="#475569"
                                    value={bankDetails.accountHolderName}
                                    onChangeText={(v) => setBankDetails(p => ({ ...p, accountHolderName: v }))}
                                />
                                <AppText style={[styles.inputLabel, { marginTop: 12 }]}>Account Number</AppText>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="000000000000"
                                    placeholderTextColor="#475569"
                                    keyboardType="numeric"
                                    value={bankDetails.accountNumber}
                                    onChangeText={(v) => setBankDetails(p => ({ ...p, accountNumber: v }))}
                                />
                                <AppText style={[styles.inputLabel, { marginTop: 12 }]}>IFSC Code</AppText>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="SBIN0001234"
                                    placeholderTextColor="#475569"
                                    autoCapitalize="characters"
                                    value={bankDetails.ifscCode}
                                    onChangeText={(v) => setBankDetails(p => ({ ...p, ifscCode: v }))}
                                />
                                <AppText style={[styles.inputLabel, { marginTop: 12 }]}>Bank Name</AppText>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="SBI, HDFC..."
                                    placeholderTextColor="#475569"
                                    value={bankDetails.bankName}
                                    onChangeText={(v) => setBankDetails(p => ({ ...p, bankName: v }))}
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleSaveSettings}
                            disabled={isUpdatingSettings}
                        >
                            {isUpdatingSettings ? <ActivityIndicator color="white" /> : <AppText style={styles.confirmBtnText} weight="bold">Save Details</AppText>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    helpBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#00B1FC',
    },
    tabText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    tabContent: {
        paddingBottom: 40,
    },
    statsGrid: {
        marginBottom: 25,
    },
    mainStatCard: {
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    statInfo: {
        flex: 1,
    },
    mainStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: 4,
    },
    mainStatValue: {
        color: 'white',
        fontSize: 32,
    },
    withdrawMainBtn: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    withdrawBtnText: {
        color: '#4F46E5',
        fontSize: 13,
    },
    subStatsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    subStatCard: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    subStatLabel: {
        color: '#64748B',
        fontSize: 12,
        marginBottom: 4,
    },
    subStatValue: {
        color: 'white',
        fontSize: 20,
    },
    settingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B60',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 20,
    },
    settingsIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#00B1FC15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingsInfo: {
        flex: 1,
    },
    settingsTitle: {
        color: 'white',
        fontSize: 15,
    },
    settingsSub: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 2,
    },
    policyCard: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 10,
    },
    policyText: {
        color: '#64748B',
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
    },
    transactionCard: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    transHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    transIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#10B98115',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transInfo: {
        flex: 1,
    },
    transTitle: {
        color: 'white',
        fontSize: 14,
    },
    transDate: {
        color: '#64748B',
        fontSize: 11,
        marginTop: 2,
    },
    transAmount: {
        fontSize: 16,
        color: '#10B981',
    },
    transFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    transBuyer: {
        color: '#94A3B8',
        fontSize: 12,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
    },
    remarksContainer: {
        marginTop: 10,
        backgroundColor: '#0F172A',
        padding: 10,
        borderRadius: 8,
    },
    remarksText: {
        color: '#94A3B8',
        fontSize: 11,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        color: 'white',
    },
    availableBox: {
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    availableLabel: {
        color: '#64748B',
        fontSize: 12,
        marginBottom: 4,
    },
    availableValue: {
        color: '#00B1FC',
        fontSize: 24,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 13,
        marginBottom: 10,
        marginLeft: 4,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderRadius: 16,
        paddingHorizontal: 20,
        marginBottom: 30,
        height: 64,
        borderWidth: 1,
        borderColor: '#334155',
    },
    currencyPrefix: {
        fontSize: 24,
        color: 'white',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    confirmBtn: {
        backgroundColor: '#00B1FC',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    confirmBtnText: {
        color: 'white',
        fontSize: 16,
    },
    methodToggle: {
        flexDirection: 'row',
        backgroundColor: '#0F172A',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
    },
    methodBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeMethod: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    methodText: {
        color: '#64748B',
        fontSize: 14,
    },
    activeMethodText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 30,
    },
    textInput: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: 'white',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#334155',
    }
});

export default EarningsPayouts;
