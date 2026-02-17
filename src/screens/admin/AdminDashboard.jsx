import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import AppText from '../../components/AppText';
import { Ionicons } from "@expo/vector-icons";
import StatCard from '../../components/admin/StatCard';
import ModerationCard from '../../components/admin/ModerationCard';
import Loader from '../../components/Loader';

// Mock Data (Replace with API later)
const MOCK_STATS = [
    { title: 'Pending Reviews', value: '124', icon: 'clipboard', color: '#ecc94b', percentage: '+12%' },
    { title: 'Flagged Content', value: '8', icon: 'flag', color: '#f56565', percentage: '+2%' },
    { title: 'Topper Profiles', value: '12', icon: 'school', color: '#4299e1', percentage: '+5%' },
    { title: 'Total Revenue', value: '$12,450', icon: 'cash', color: '#48bb78', percentage: '+15%' },
];

const MOCK_PENDING_NOTES = [
    {
        id: '1',
        user: { name: 'Sarah Jenkins', subtitle: 'Physics Topper • 2023 Batch', timeAgo: '2h ago', avatar: null },
        content: { title: 'Advanced Calculus II: Integration Techniques', meta: '24 Pages • PDF • 12MB', tags: ['Math', 'Exam Prep'] }
    },
    {
        id: '2',
        user: { name: 'Jessica Pearson', subtitle: 'History Major • 2024 Batch', timeAgo: '1d ago', avatar: null },
        content: { title: 'World History: Industrial Revolution Summary', meta: '15 Pages • PDF • 8.1MB', tags: ['Humanities'] }
    }
];

const AdminDashboard = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Notes'); // 'Notes' or 'Users'
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (id) => {
        console.log("Approve", id);
        // Implement API call
    };

    const handleReject = (id) => {
        console.log("Reject", id);
        // Implement API call
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu" size={24} color="white" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Admin Panel</AppText>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications" size={20} color="white" />
                        <View style={styles.badgeDot} />
                    </TouchableOpacity>
                    <Image source={require('../../../assets/admin.avif')} style={styles.profilePic} />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {MOCK_STATS.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search notes, IDs, or toppers..."
                        placeholderTextColor="#718096"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <Ionicons name="options" size={20} color="#718096" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Notes' && styles.activeTab]}
                        onPress={() => setActiveTab('Notes')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'Notes' && styles.activeTabText]}>
                            Notes Moderation
                        </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Users' && styles.activeTab]}
                        onPress={() => setActiveTab('Users')}
                    >
                        <AppText style={[styles.tabText, activeTab === 'Users' && styles.activeTabText]}>
                            User Management
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>
                        Pending Uploads <AppText style={{ color: '#718096' }}>(12)</AppText>
                    </AppText>
                    <TouchableOpacity style={styles.sortButton}>
                        <AppText style={styles.sortText}>Sort by Date</AppText>
                        <Ionicons name="chevron-down" size={12} color="#4299e1" />
                    </TouchableOpacity>
                </View>

                {/* List Items */}
                {MOCK_PENDING_NOTES.map((item) => (
                    <ModerationCard
                        key={item.id}
                        user={item.user}
                        content={item.content}
                        onView={() => console.log('View', item.id)}
                        onApprove={() => handleApprove(item.id)}
                        onReject={() => handleReject(item.id)}
                    />
                ))}

            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#1a202c',
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        marginLeft: 15,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        position: 'relative',
    },
    badgeDot: {
        position: 'absolute',
        top: 0,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e53e3e',
        borderWidth: 1,
        borderColor: '#1a202c',
    },
    profilePic: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4a5568',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#2d3748',
        borderRadius: 12,
        padding: 4,
        marginBottom: 25,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1a202c',
    },
    tabText: {
        color: '#718096',
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: 'white',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    sortText: {
        color: '#4299e1',
        fontSize: 14,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3182ce',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#3182ce',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    }
});

export default AdminDashboard;
