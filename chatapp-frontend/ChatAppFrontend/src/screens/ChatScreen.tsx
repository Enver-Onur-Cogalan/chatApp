import React, { useEffect, useRef, useState } from 'react';
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

import socket from '../utils/socket';
import MessageBubble from '../components/MessageBubble';
import authStore from '../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadMessages, saveMessages } from '../services/chatStorageService';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Chat: undefined;
};

export default function ChatScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
    const [input, setInput] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleLogout = async () => {
        await authStore.logout();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    useEffect(() => {
        (async () => {
            const stored = await loadMessages();
            setMessages(stored);
        })();

        const handleReceive = (data: { text: string; sender: string }) => {
            setMessages(prev => {
                const updated = [...prev, data];
                saveMessages(updated);
                return updated;
            });
        };

        socket.on('receiveMessage', handleReceive);
        return () => {
            socket.off('receiveMessage', handleReceive);
        };
    }, []);

    const sendMessage = () => {
        if (input.trim() === '') return;

        const newMsg = {
            text: input,
            sender: authStore.username,
            receiver: 'all',
        };

        socket.emit('sendMessage', newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setInput('');
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>ChatApp</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Icon name='log-out-outline' size={24} color='#333' />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item.text}
                            sender={item.sender}
                            isOwnMessage={item.sender === authStore.username}
                        />
                    )}
                    contentContainerStyle={styles.chatContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Write your message...'
                        value={input}
                        onChangeText={setInput}
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
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
        backgroundColor: '#f1f1f1'
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
    }
});