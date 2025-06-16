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
const API = `http://${HOST}:5001/api/messages`;

export function useChat(withUser?: string) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const listRef = useRef<any>(null);
    const readSet = useRef<Set<string>>(new Set());

    // load history once
    useEffect(() => {
        const token = authStore.token;
        const url = withUser
            ? `${API}/private/${withUser}`
            : API;

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

        socket.on('receiveMessage', onReceive);
        socket.on('messageRead', onRead);
        return () => {
            socket.off('receiveMessage', onReceive);
            socket.off('messageRead', onRead);
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

    return { messages, listRef, send, remove, clearAll, readSet };
}