import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMsg } from "../hooks/useChat";
import axios from "axios";

const KEY = 'chatMessages';

const HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API = `http://${HOST}:5001/api/messages`;

async function getAuthHeaders(): Promise<{ Authorization?: string }> {
    const token = AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function saveMessages(messages: ChatMsg[]) {
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(messages));
    } catch (e) {
        console.error('Chat storage save error:', e);
    }
}


export async function loadMessages(): Promise<ChatMsg[]> {
    try {
        const headers = await getAuthHeaders();
        const res = await axios.get<ChatMsg[]>(API, { headers });

        return res.data;
    } catch (e) {
        console.warn('Mesaj geçmişi yüklenemedi (API), fallback olarak yerelden yüklenecek:', e);
    }

    try {
        const json = await AsyncStorage.getItem(KEY);
        if (json) {
            const arr: any[] = JSON.parse(json);
            return arr.map((m) => ({
                ...m,
                status: (m.status ?? 'sent') as ChatMsg['status'],
            }));
        }
    } catch (e) {
        console.error('Chat storage load error:', e);
    }

    return [];
}

export async function clearMessages() {
    try {
        await AsyncStorage.removeItem(KEY);
    } catch (e) {
        console.error('Chat storage clear error:', e);
    }
}