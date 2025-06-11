import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = 'chatMessages';

export async function saveMessages(messages: { text: string; sender: string }[]) {
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(messages));
    } catch (e) {
        console.error('Chat storage save error:', e);
    }
}

export async function loadMessages(): Promise<{ text: string; sender: string }[]> {
    try {
        const json = await AsyncStorage.getItem(KEY);
        if (!json) return [];
        return JSON.parse(json);
    } catch (e) {
        console.error('Chat storage load error:', e)
        return [];
    }
}

export async function clearMessages() {
    try {
        await AsyncStorage.removeItem(KEY);
    } catch (e) {
        console.error('Chat storage clear error:', e);
    }
}