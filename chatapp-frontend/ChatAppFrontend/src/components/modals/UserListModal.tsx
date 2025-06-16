import React from "react";
import { Modal, Pressable, StyleSheet, View, Text, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import authStore from "../../stores/authStore";

interface Props {
    visible: boolean;
    users: string[];
    onClose: () => void;
    onSelect: (user?: string) => void;
}

export const UserListModal: React.FC<Props> = ({
    visible,
    users,
    onClose,
    onSelect,
}) => {
    const list = users.filter(u => u !== authStore.username);

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
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.card}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.name}>{item}</Text>
                                <View style={styles.statusRow}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.statusText}>Online</Text>
                                </View>
                            </Pressable>
                        )}
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
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: 'green',
        marginRight: 6,
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