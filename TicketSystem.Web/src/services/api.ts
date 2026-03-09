import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7106/api';

export const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);

            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);