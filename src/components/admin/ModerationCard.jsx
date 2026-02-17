import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppText from '../AppText';
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from '../ReausableButton';

const ModerationCard = ({
    user,
    content,
    onView,
    onReject,
    onApprove,
    isUserRequest = false
}) => {
    return (
        <View style={styles.container}>
            {/* User Header */}
            <View style={styles.header}>
                <Image
                    source={user.avatar ? { uri: user.avatar } : require('../../../assets/student.avif')}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <AppText style={styles.name}>{user.name}</AppText>
                        <AppText style={styles.timeAgo}>{user.timeAgo}</AppText>
                    </View>
                    <AppText style={styles.subtitle}>{user.subtitle}</AppText>
                </View>
            </View>

            {/* Content Preview */}
            <View style={styles.contentBox}>
                <View style={styles.thumbnail}>
                    <Ionicons name="document-text" size={24} color="#718096" />
                </View>
                <View style={styles.contentDetails}>
                    <AppText style={styles.contentTitle} numberOfLines={2}>
                        {content.title}
                    </AppText>
                    <AppText style={styles.contentMeta}>
                        {content.meta}
                    </AppText>
                    <View style={styles.tagsRow}>
                        {content.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <AppText style={styles.tagText}>{tag}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.viewButton} onPress={onView}>
                    <AppText style={styles.viewText}>View</AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                    <Ionicons name="close" size={16} color="#fc8181" />
                    <AppText style={styles.rejectText}>Reject</AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <AppText style={styles.approveText}>Approve</AppText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2d3748',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    timeAgo: {
        color: '#718096',
        fontSize: 12,
    },
    subtitle: {
        color: '#a0aec0',
        fontSize: 12,
        marginTop: 2,
    },
    contentBox: {
        flexDirection: 'row',
        backgroundColor: '#1a202c',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },
    thumbnail: {
        width: 50,
        height: 60,
        backgroundColor: '#cbd5e0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    contentTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20
    },
    contentMeta: {
        color: '#718096',
        fontSize: 12,
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6
    },
    tag: {
        backgroundColor: '#2c5282',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        color: '#bee3f8',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    viewButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4a5568',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewText: {
        color: '#cbd5e0',
        fontWeight: '600',
        fontSize: 14,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(229, 62, 62, 0.2)',
    },
    rejectText: {
        color: '#fc8181',
        fontWeight: '600',
        fontSize: 14,
    },
    approveButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#3182ce',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    approveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default ModerationCard;
