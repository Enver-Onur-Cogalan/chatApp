import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

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

    async login(username: string, password: string) {
        this.isLoading = true;
        this.error = '';

        try {
            const res = await axios.post('http://10.0.2.2:5001/api/auth/login', {
                username,
                password,
            });

            runInAction(() => {
                this.token = res.data.token;
                this.username = res.data.username;
                this.isLoading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                this.error = err?.response?.data?.message || 'Bir hata oluştu';
                this.isLoading = false;
            });
        }
    }

    logout() {
        this.token = '';
        this.username = '';
    }

    get isLoggedIn() {
        return !!this.token;
    }
}

const authStore = new AuthStore();
export default authStore;