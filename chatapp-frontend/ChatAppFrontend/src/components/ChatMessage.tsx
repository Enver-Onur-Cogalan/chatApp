import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ChatMsg } from '../hooks/useChat'
import MessageBubble from './MessageBubble';
import authStore from '../stores/authStore';

interface Props { msg: ChatMsg; onDelete(id: string): void; }

const ChatMessage: React.FC<Props> = ({ msg, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);


    return (
        <View style={styles.wrapper}>
            {showDelete && (
                <TouchableOpacity
                    style={styles.deleteBar}
                    onPress={() => onDelete(msg.id)}
                >
                    <Icon name='trash-outline' size={20} color='#fff' />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                activeOpacity={0.8}
                onLongPress={() => {
                    if (msg.sender === authStore.username) {
                        setShowDelete(true);
                    }
                }}
                onPress={() => setShowDelete(false)}
            >
                <MessageBubble
                    message={msg.text}
                    sender={msg.sender}
                    isOwnMessage={msg.sender === authStore.username}
                    timestamp={msg.timestamp}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ChatMessage;

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 4,
    },
    deleteBar: {
        position: 'absolute',
        top: -24,
        right: 0,
        backgroundColor: '#f44',
        padding: 6,
        borderRadius: 4,
        zIndex: 1,
    },
});