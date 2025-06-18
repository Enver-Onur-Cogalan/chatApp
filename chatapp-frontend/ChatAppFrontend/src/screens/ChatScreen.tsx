import React, { useEffect, useState } from 'react';
import {
    FlatList,
    ImageBackground,
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
import { SafeAreaView } from 'react-native-safe-area-context';

import authStore from '../stores/authStore';
import { useChat } from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import socket from '../utils/socket';
import { UserListModal } from '../components/modals/UserListModal';
import theme from '../theme/theme';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Chat: undefined;
};

export default function ChatScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [input, setInput] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);

    const { messages, listRef, send, remove, clearAll, readSet, typingUsers, sendTyping, presence } = useChat(selectedUser);

    useEffect(() => {
        if (selectedUser) {
            socket.emit('joinRoom', { other: selectedUser });
        }
    }, [selectedUser]);

    const handleLogout = async () => {
        socket.emit('logout', authStore.username);

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
        sendTyping(false);
        setInput('');
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom', 'top']}>
            <ImageBackground
                source={require('../assets/lined-paper.png')}
                style={styles.background}
                imageStyle={styles.paperImage}
            >

                <UserListModal
                    visible={modalVisible}
                    presence={presence}
                    onClose={() => setModalVisible(false)}
                    onSelect={user => setSelectedUser(user)}
                />

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
                                    !selectedUser && styles.roomButtonActive,
                                ]}
                            >
                                <Text style={styles.roomButtonText}>Global</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={styles.userListButton}
                            >
                                <Icon name='document-text-outline' size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={clearAll} style={{ marginRight: 50 }}>
                            <Icon name='trash-bin-outline' size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogout}>
                            <Icon name='log-out-outline' size={24} color={theme.colors.textPrimary} />
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
                    {typingUsers.length > 0 && (
                        <View style={styles.typingContainer}>
                            <Text style={styles.typingText}>
                                {typingUsers.join(', ')} typing...
                            </Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder='Write your message...'
                            placeholderTextColor={theme.colors.textPrimary + '99'}
                            value={input}
                            onChangeText={text => {
                                setInput(text);
                                sendTyping(true);
                            }}
                            onBlur={() => sendTyping(false)}
                            onEndEditing={() => sendTyping(false)}
                            onSubmitEditing={() => sendTyping(false)}
                        />
                        <TouchableOpacity onPress={() => { handleSend(); sendTyping(false); }} style={styles.sendButton}>
                            <Icon name='paper-plane' size={20} color='#fff' />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    background: {
        flex: 1,
    },
    paperImage: {
        resizeMode: 'repeat',
    },
    header: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: theme.colors.lines,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: theme.typography.header.fontSize,
        fontFamily: theme.typography.header.fontFamily,
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
    },
    chatContainer: {
        padding: 10,
    },
    typingContainer: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    typingText: {
        fontStyle: 'italic',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.timestamp.fontFamily,
        fontSize: theme.typography.timestamp.fontSize,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderColor: theme.colors.lines,
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        borderColor: theme.colors.accent,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 15,
        backgroundColor: theme.colors.edgeShadow,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.body.fontFamily,
        fontSize: theme.typography.body.fontSize,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: theme.colors.accent,
        borderRadius: 50,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendText: {
        color: '#fff',
        fontFamily: theme.typography.button.fontFamily,
        fontSize: theme.typography.button.fontSize,
    },
    roomsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roomButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.lines,
    },
    roomButtonActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    roomButtonText: {
        fontFamily: theme.typography.button.fontFamily,
        fontSize: theme.typography.button.fontSize,
        color: theme.colors.textPrimary,
    },
    userListButton: {
        alignItems: 'center',
        marginLeft: 4,
    },
});