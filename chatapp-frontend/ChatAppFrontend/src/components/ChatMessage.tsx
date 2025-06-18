import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ChatMsg } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import authStore from '../stores/authStore';
import socket from '../utils/socket';
import theme from '../theme/theme';

interface Props { msg: ChatMsg; onDelete(id: string): void; readSet: React.MutableRefObject<Set<string>>; }

const ChatMessage: React.FC<Props> = ({ msg, onDelete, readSet }) => {
    const [showDelete, setShowDelete] = useState(false);
    const scale = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${interpolate(scale.value, [0, 1], [-10, 0])}deg` }
        ]
    }));

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    }, []);

    useEffect(() => {
        if (
            msg.sender !== authStore.username &&
            msg.status === 'sent' &&
            !readSet.current.has(msg.id)
        ) {
            readSet.current.add(msg.id);
            // console.log('🔔 [MSG] emit readMessage for:', msg.id);
            socket.emit('readMessage', {
                messageId: msg.id,
                reader: authStore.username,
            });
        }
    }, []);


    return (
        <Animated.View style={[styles.wrapper, animatedStyle]}>
            {showDelete && (
                <TouchableOpacity
                    style={styles.deleteClip}
                    onPress={() => onDelete(msg.id)}
                >
                    <Icon name='attach-outline' size={24} color={theme.colors.accent} />
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
                    status={msg.status}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default ChatMessage;

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 6,
    },
    deleteClip: {
        position: 'absolute',
        top: -6,
        right: 4,
        padding: 4,
        zIndex: 1,
    },
});