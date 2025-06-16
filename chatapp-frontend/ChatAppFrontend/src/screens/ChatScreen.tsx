import React, { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import authStore from '../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import socket from '../utils/socket';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Chat: undefined;
};

export default function ChatScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [input, setInput] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { messages, listRef, send, remove, clearAll, readSet } = useChat(selectedUser);

    const handleLogout = async () => {
        await authStore.logout();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };


    const handleSend = () => {
        if (!input.trim()) return;
        send(input);
        setInput('');
    };

    useEffect(() => {
        socket.on('presence', (users: string[]) => {
            setOnlineUsers(users);
        });
        return () => {
            socket.off('presence');
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>ChatApp</Text>
                    <View style={styles.roomsContainer}>
                        <TouchableOpacity
                            onPress={() => setSelectedUser(undefined)}
                            style={[
                                styles.roomButton,
                                !selectedUser && styles.roomButtonActive
                            ]}
                        >
                            <Text>Global</Text>
                        </TouchableOpacity>
                        {onlineUsers
                            .filter(user => user !== authStore.username)
                            .map(user => (
                                <TouchableOpacity
                                    key={user}
                                    onPress={() => setSelectedUser(user)}
                                    style={[
                                        styles.roomButton,
                                        selectedUser === user && styles.roomButtonActive
                                    ]}
                                >
                                    <Text>{user}</Text>
                                </TouchableOpacity>
                            ))}
                    </View>

                    <TouchableOpacity onPress={clearAll} style={{ marginRight: 50 }}>
                        <Icon name='trash-bin-outline' size={24} color='#333' />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout}>
                        <Icon name='log-out-outline' size={24} color='#333' />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => `${item.id}-${item.status}`}
                    extraData={messages}
                    renderItem={({ item }) => (
                        <ChatMessage msg={item} onDelete={remove} readSet={readSet} />
                    )}
                    contentContainerStyle={styles.chatContainer}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Write your message...'
                        value={input}
                        onChangeText={setInput}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderColor: 'green',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 15,
        backgroundColor: '#f1f1f1',
    },
    chatContainer: {
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    sendText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    roomButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#888',
    },
    roomButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    roomsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 4,
    },
});