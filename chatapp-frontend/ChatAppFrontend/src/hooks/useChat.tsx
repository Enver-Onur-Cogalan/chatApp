import React, { useCallback, useEffect, useRef, useState } from "react";
import { loadMessages, saveMessages, clearMessages } from "../services/chatStorageService";
import authStore from "../stores/authStore";
import socket from "../utils/socket";
import { Platform } from "react-native";
import axios from "axios";

export interface ChatMsg {
    id: string;
    text: string;
    sender: string;
    receiver?: string;
    timestamp: string;
    status: 'sent' | 'read';
}

const HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_BASE = `http://${HOST}:5001/api`;
const MSG_API = `${API_BASE}/messages`;
const USERS_API = `${API_BASE}/users`;


export function useChat(withUser?: string) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const listRef = useRef<any>(null);
    const readSet = useRef<Set<string>>(new Set());

    // load history once
    useEffect(() => {
        const token = authStore.token;
        const url = withUser
            ? `${MSG_API}/private/${withUser}`
            : MSG_API;

        console.log("🛰️ [useChat] Fetching history from:", url);

        (async () => {
            try {
                const res = await axios.get<ChatMsg[]>(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ [useChat] History response:", res.data.length, "messages");
                setMessages(res.data);
            } catch (err: any) {
                console.warn("⚠️ [useChat] History load failed, fallback to AsyncStorage:", err.response?.status, err.message);
                const stored = await loadMessages();
                console.log("📂 [useChat] Loaded from AsyncStorage:", stored.length, "messages");
                setMessages(stored);
            }
        })();

        socket.emit('register', authStore.username);

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
            console.log("✅ [HOOK] messageRead received:", data);
            setMessages((prev) => {
                const next = prev.map((m) =>
                    m.id === data.id ? { ...m, status: 'read' } : m
                );
                console.log("📣 [HOOK] messages after marking read:", next);
                saveMessages(next);
                return next;
            });
        };

        const onPresence = (list: string[]) => {
            setOnlineUsers(list);
        };

        const onTyping = ({ sender }: { sender: string }) => {
            if (sender === authStore.username) return;
            setTypingUsers(u => Array.from(new Set([...u, sender])));
        };
        const onStop = ({ sender }: { sender: string }) => {
            if (sender === authStore.username) return;
            setTypingUsers(u => u.filter(x => x !== sender));
        };

        socket.on('receiveMessage', onReceive);
        socket.on('messageRead', onRead);
        socket.on('typing', onTyping);
        socket.on('stopTyping', onStop);
        socket.on('presence', onPresence);

        return () => {
            socket.off('receiveMessage', onReceive);
            socket.off('messageRead', onRead);
            socket.off('typing', onTyping);
            socket.off('stopTyping', onStop);
            socket.off('presence', onPresence);
        };
    }, [withUser]);

    const send = useCallback(async (text: string) => {
        const now = new Date().toISOString();
        const msg: ChatMsg = {
            id: Math.random().toString(),
            text,
            sender: authStore.username,
            receiver: withUser ?? "all",
            timestamp: now,
            status: "sent",
        };
        socket.emit("sendMessage", msg);
    }, [withUser]);

    const sendTyping = useCallback((isTyping: boolean) => {
        socket.emit(isTyping ? 'typing' : 'stopTyping', {
            sender: authStore.username,
            receiver: withUser ?? 'all'
        });
    }, [withUser]);

    const remove = useCallback(async (id: string) => {
        const url = `${API}/${id}`;
        const token = authStore.token;
        try {
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`✅ [useChat] Server deleted message ${id}`);
        } catch (err) {
            console.warn(`⚠️ [useChat] Server delete failed, removing locally`, err);
        }
        setMessages(prev => {
            const next = prev.filter(m => m.id !== id);
            saveMessages(next);
            return next;
        });
    }, []);

    const clearAll = useCallback(async () => {
        const token = authStore.token;
        const url = withUser
            ? `${API}/private/${withUser}`
            : API;

        try {
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("🗑️ [useChat] Server chat history cleared");
        } catch (err) {
            console.warn("⚠️ [useChat] Server clear failed, proceeding to local clear", err);
        }
        await clearMessages();
        setMessages([]);
        console.log("📂 [useChat] Local chat history cleared");
    }, [withUser]);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get<string[]>(USERS_API, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                });
                setAllUsers(res.data);
            } catch (e) {
                console.warn("⚠️ [useChat] couldn’t load all users", e)
            }
        })();
    }, []);

    return { messages, listRef, send, sendTyping, typingUsers, remove, clearAll, readSet, allUsers, onlineUsers };
}