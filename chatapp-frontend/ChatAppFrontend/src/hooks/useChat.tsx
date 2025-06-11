import React, { useEffect, useRef, useState } from "react";
import { loadMessages, saveMessages, clearMessages } from "../services/chatStorageService";
import authStore from "../stores/authStore";
import socket from "../utils/socket";

export interface ChatMsg {
    id: string;
    text: string;
    sender: string;
    timestamp: string;
    status: 'sent' | 'read';
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const listRef = useRef<any>(null);
    const readSet = useRef<Set<string>>(new Set());

    // load history once
    useEffect(() => {
        socket.emit('register', authStore.username);

        (async () => {
            const stored = await loadMessages();
            setMessages(
                stored.map((m) => ({
                    ...m,
                    status: (m.status ?? 'sent') as 'sent' | 'read',
                }))
            );
        })();

        const onReceive = (data: ChatMsg) => {
            setMessages((prev) => {
                const next = [...prev, data];
                saveMessages(next);
                return next;
            });

            if (data.sender !== authStore.username && data.status === "sent" && !readSet.current.has(data.id)) {
                // console.log("🔔 [HOOK] one-time emit readMessage for:", data.id);
                socket.emit("readMessage", {
                    messageId: data.id,
                    reader: authStore.username,
                });
                readSet.current.add(data.id);
            }
        };

        const onRead = (data: { id: string; reader: string; }) => {
            // console.log("✅ [HOOK] messageRead received:", data);
            setMessages((prev) => {
                const next = prev.map((m) =>
                    m.id === data.id ? { ...m, status: 'read' } : m
                );
                saveMessages(next);
                return next;
            });
        };

        socket.on('receiveMessage', onReceive);
        socket.on('messageRead', onRead);
        return () => {
            socket.off('receiveMessage', onReceive);
            socket.off('messageRead', onRead);
        };
    }, []);

    const send = async (text: string, receiver: 'all') => {
        const now = new Date().toISOString();
        const msg: ChatMsg = {
            id: Math.random().toString(),
            text,
            sender: authStore.username,
            timestamp: now,
            status: 'sent' as 'sent',
        };
        socket.emit('sendMessage', { ...msg, receiver });
    };

    const remove = (id: string) => {
        setMessages(prev => {
            const next = prev.filter((m) => m.id !== id);
            saveMessages(next);
            return next;
        });
    };

    const clearAll = async () => {
        await clearMessages();
        setMessages([]);
    };

    return { messages, listRef, send, remove, clearAll, readSet };
}