import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://${HOST}:5001/api/auth`;

class AuthStore {
    username: string = '';
    token: string = '';
    isLoading: boolean = false;
    error: string = '';

    constructor() {
        makeAutoObservable(this);
    }

    setUsername(username: string) {
        this.username = username;
    }


    // OtoLogin
    async loadUserFromStorage() {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUsername = await AsyncStorage.getItem('username');

            if (storedToken && storedUsername) {
                runInAction(() => {
                    this.token = storedToken;
                    this.username = storedUsername;
                });
            }
        } catch (err) {
            console.log('Failed to load user information:', err);
        }
    }

    async login(username: string, password: string) {
        this.isLoading = true;
        this.error = '';

        try {
            const res = await axios.post(`${BASE_URL}/login`, {
                username,
                password,
            });

            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('username', res.data.username);

            runInAction(() => {
                this.token = res.data.token;
                this.username = res.data.username;
                this.isLoading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err?.response?.data?.message || 'An error occurred';
                this.isLoading = false;
            });
        }
    }

    async register(username: string, password: string) {
        this.isLoading = true;
        this.error = '';

        try {
            const res = await axios.post(`${BASE_URL}/register`, {
                username,
                password,
            });

            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('username', res.data.username);

            runInAction(() => {
                this.token = res.data.token;
                this.username = res.data.username;
                this.isLoading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err?.response?.data?.message || 'An error occurred';
                this.isLoading = false;
            });
        }
    }

    async logout() {
        this.token = '';
        this.username = '';

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('username');
    }

    get isLoggedIn() {
        return !!this.token;
    }
}

const authStore = new AuthStore();
export default authStore;