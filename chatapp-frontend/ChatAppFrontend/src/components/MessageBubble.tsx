import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import theme from "../theme/theme";

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    sender: string;
    timestamp: string;
    status: 'sent' | 'read';
}

const formatTime = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime())
        ? ''
        : d.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, sender, timestamp, status = 'sent' }) => {
    const bgColor = isOwnMessage
        ? theme.colors.postItYellow
        : theme.colors.postItGreen;

    return (
        <View
            style={[
                styles.bubble,
                isOwnMessage ? styles.ownBubble : styles.otherBubble,
                { backgroundColor: bgColor },
            ]}
        >
            {!isOwnMessage && <Text style={styles.sender}>{sender}</Text>}
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
            {isOwnMessage && (
                <Icon
                    name={status === 'read' ? 'checkmark-done' : 'checkmark'}
                    size={12}
                    color={status === 'read' ? theme.colors.accent : theme.colors.lines}
                    style={styles.tick}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        maxWidth: '80%',
        marginVertical: 4,
        padding: 12,
        borderRadius: 6,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: { elevation: 2 },
        }),
        alignSelf: 'flex-start',
    },
    sender: {
        fontFamily: theme.typography.subHeader.fontFamily,
        fontSize: theme.typography.subHeader.fontSize,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    message: {
        fontFamily: theme.typography.body.fontFamily,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textPrimary,
        marginBottom: 6,
    },
    timeText: {
        fontFamily: theme.typography.timestamp.fontFamily,
        fontSize: theme.typography.timestamp.fontSize,
        color: theme.colors.textPrimary + '99',
        alignSelf: 'flex-end',
    },
    tick: {
        marginLeft: 4,
        alignSelf: 'flex-end',
    },
    ownBubble: {
        alignSelf: 'flex-end',
    },
    otherBubble: {
        alignSelf: 'flex-start',
    },
});

export default MessageBubble;