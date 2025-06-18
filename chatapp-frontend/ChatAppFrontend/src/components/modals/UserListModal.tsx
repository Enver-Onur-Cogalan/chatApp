import React from "react";
import { Modal, Pressable, StyleSheet, View, Text, FlatList, ImageBackground, Platform } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import authStore from "../../stores/authStore";
import { PresenceInfo } from "../../hooks/useChat";
import theme from "../../theme/theme";

interface Props {
    visible: boolean;
    presence: PresenceInfo[];
    onClose: () => void;
    onSelect: (user?: string) => void;
}

export const UserListModal: React.FC<Props> = ({
    visible,
    presence,
    onClose,
    onSelect,
}) => {
    const list = presence.filter(p => p.username !== authStore.username);

    const formatLastSeen = (iso: string | null) => {
        if (!iso) return 'Never';
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ImageBackground
                    source={require('../../assets/lined-paper.png')}
                    style={styles.container}
                    imageStyle={styles.paperImage}
                >
                    <View style={styles.header}>
                        <Icon name="book-outline" size={24} color={theme.colors.textPrimary} />
                        <Text style={styles.title}>Users</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                    </View>

                    <FlatList
                        data={list}
                        keyExtractor={item => item.username}
                        renderItem={({ item }) => {
                            const { username, online, lastSeen } = item;
                            return (
                                <Pressable
                                    style={[styles.userNote, online ? {} : styles.offlineNote]}
                                    onPress={() => {
                                        onSelect(username);
                                        onClose();
                                    }}
                                >
                                    <Icon name="pin-outline" size={20} color={theme.colors.accent} style={styles.pin} />
                                    <Text style={styles.name}>{username}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={[
                                            styles.dot,
                                            online ? styles.onlineDot : styles.offlineDot,
                                        ]}
                                        />
                                        <Text style={styles.statusText}>
                                            {online
                                                ? 'Online'
                                                : `Last seen ${lastSeen ? formatLastSeen(lastSeen) : 'Never'}`
                                            }
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={styles.empty}>There is no one else right now.</Text>
                        }
                    />
                </ImageBackground>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        maxHeight: '75%',
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        overflow: 'hidden',
    },
    paperImage: {
        resizeMode: 'repeat',
        opacity: 0.15,
    },
    header: {
        flexDirection: 'row',
        padding: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: theme.colors.lines,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontFamily: theme.typography.header.fontFamily,
        fontSize: theme.typography.header.fontSize,
        color: theme.colors.textPrimary,
    },
    userNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.postItBlue,
        padding: 10,
        marginVertical: 6,
        marginHorizontal: 8,
        borderRadius: 6,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
            android: { elevation: 2 },
        }),
    },
    offlineNote: {
        opacity: 0.7,
    },
    pin: {
        transform: [{ rotate: '-20deg' }],
    },
    userName: {
        flexShrink: 1,
        fontFamily: theme.typography.body.fontFamily,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textPrimary,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 10,
        marginRight: 6,
    },
    onlineDot: {
        backgroundColor: theme.colors.online,
    },
    offlineDot: {
        backgroundColor: theme.colors.offline,
    },
    statusText: {
        fontFamily: theme.typography.timestamp.fontFamily,
        fontSize: theme.typography.timestamp.fontSize,
        color: theme.colors.textPrimary,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.body.fontFamily,
    },
});