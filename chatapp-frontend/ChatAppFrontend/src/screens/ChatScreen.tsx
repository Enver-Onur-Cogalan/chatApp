import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import socket from '../utils/socket';

export default function ChatScreen() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        socket.on('receiveMessage', (data: { message: string }) => {
            setMessages((prev) => [...prev, data.message]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = () => {
        if (input.trim() === '') return;
        socket.emit('sendMessage', { message: input });
        setMessages((prev) => [...prev, input]);
        setInput('');
    };


    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
                keyExtractor={(item, index) => index.toString()}
            />

            <TextInput
                value={input}
                onChangeText={setInput}
                style={styles.input}
                placeholder='Write your message'
            />

            <Button title='Send' onPress={sendMessage} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    message: {
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 6,
        marginVertical: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginVertical: 10,
    }

});