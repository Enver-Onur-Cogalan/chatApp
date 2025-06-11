import React, { useEffect, useRef, useState } from "react";
import socketIO from 'socket.io-client'
import { loadMessages, saveMessages, clearMessages } from "../services/chatStorageService";
import authStore from "../stores/authStore";
import { Platform } from "react-native";


const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const socket = socketIO(`http://${host}:5001`, { transports: ['websocket'] });

export interface ChatMsg { id: string; text: string; sender: string; timestamp: string; }

export function useChat() {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const listRef = useRef<any>(null);

    // load history once
    useEffect(() => {
        (async () => {
            const stored = await loadMessages();
            setMessages(stored);
        })();

        const onReceive = (data: ChatMsg) => {
            setMessages(prev => {
                const next = [...prev, data];
                saveMessages(next);
                return next;
            });
        };

        socket.on('receiveMessage', onReceive);
        return () => { socket.off('receiveMessage', onReceive); };
    }, []);

    const send = async (text: string, receiver: 'all') => {
        const now = new Date().toISOString();
        const msg: ChatMsg = {
            id: Math.random().toString(),
            text,
            sender: authStore.username,
            timestamp: now,
        };
        socket.emit('sendMessage', { ...msg, receiver });
        setMessages(prev => {
            const next = [...prev, msg];
            saveMessages(next);
            return next;
        });
    };

    const remove = (id: string) => {
        setMessages(prev => {
            const next = prev.filter(m => m.id !== id);
            saveMessages(next);
            return next;
        });
    };

    const clearAll = async () => {
        await clearMessages();
        setMessages([]);
    };

    return { messages, listRef, send, remove, clearAll };
}