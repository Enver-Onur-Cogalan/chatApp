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

export interface PresenceInfo {
    username: string;
    online: boolean;
    lastSeen: string | null;
}

const HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_BASE = `http://${HOST}:5001/api`;
const MSG_API = `${API_BASE}/messages`;
const USERS_API = `${API_BASE}/users`;


export function useChat(withUser?: string) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [presence, setPresence] = useState<PresenceInfo[]>([]);
    const [allUsers, setAllUsers] = useState<string[]>([]);
    const listRef = useRef<any>(null);
    const readSet = useRef<Set<string>>(new Set());

    useEffect(() => {
        (async () => {
            try {
                const { data: users } = await axios.get<string[]>(USERS_API, {
                    headers: { Authorization: `Bearer ${authStore.token}` }
                });
                setAllUsers(users);

                setPresence(users.map(u => ({
                    username: u,
                    online: false,
                    lastSeen: null,
                })));
            } catch (e) {
                console.warn("⚠️ couldn’t load all users", e);
            }
        })();
    }, []);

    useEffect(() => {
        const handlePresence = (list: PresenceInfo[]) => {
            console.log("🛰️ [useChat:onPresence] incoming presence:", list);
            setPresence(list);
        }

        socket.on('presence', handlePresence);
        return () => { socket.off('presence', handlePresence); };
    }, []);

    // load history once
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

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

        return () => {
            socket.off('receiveMessage', onReceive);
            socket.off('messageRead', onRead);
            socket.off('typing', onTyping);
            socket.off('stopTyping', onStop);
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
        const url = `${MSG_API}/${id}`;
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
            ? `${MSG_API}/private/${withUser}`
            : MSG_API;

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

    return {
        messages,
        listRef,
        send,
        sendTyping,
        typingUsers,
        remove,
        clearAll,
        readSet,
        allUsers,
        onlineUsers: presence.filter(p => p.online).map(p => p.username),
        presence,
    };
}