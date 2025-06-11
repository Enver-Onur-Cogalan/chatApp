import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
    message: string;
    isOwnMessage: boolean;
    sender: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, sender }) => {
    return (
        <View
            style={[
                styles.bubble,
                isOwnMessage ? styles.ownBubble : styles.otherBubble,
            ]}
        >
            {!isOwnMessage && <Text style={styles.sender}>{sender}</Text>}
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        maxWidth: '80%',
        marginVertical: 4,
        padding: 10,
        borderRadius: 10,
    },
    sender: {
        fontSize: 12,
        color: '#555',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    ownBubble: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    otherBubble: {
        backgroundColor: '#eee',
        alignSelf: 'flex-start',
    },
    message: {
        fontSize: 16,
    },

});

export default MessageBubble;