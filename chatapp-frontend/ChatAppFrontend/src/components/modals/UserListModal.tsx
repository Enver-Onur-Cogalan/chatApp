import React from "react";
import { Modal, Pressable, StyleSheet, View, Text, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import authStore from "../../stores/authStore";
import { PresenceInfo } from "../../hooks/useChat";

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
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Users</Text>
                        <Pressable onPress={onClose}>
                            <Icon name="close" size={24} />
                        </Pressable>
                    </View>

                    <FlatList
                        data={list}
                        keyExtractor={item => item.username}
                        renderItem={({ item }) => {
                            const { username, online, lastSeen } = item;
                            return (
                                <Pressable
                                    style={styles.card}
                                    onPress={() => {
                                        onSelect(username);
                                        onClose();
                                    }}
                                >
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
                </View>
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
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    card: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#888',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
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
        backgroundColor: 'green',
    },
    offlineDot: {
        backgroundColor: 'red',
    },
    statusText: {
        fontSize: 14,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});