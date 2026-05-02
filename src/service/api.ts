import axios from "axios";
import toast from "react-hot-toast";

export const TOKEN_STORAGE_KEY = "auth_token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        const message =
            error.response?.data?.message ??
            error.message ??
            "An unexpected error occurred";
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;
