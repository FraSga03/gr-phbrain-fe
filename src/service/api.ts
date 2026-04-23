import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);
        const message =
            error.response?.data?.message ??
            error.message ??
            "An unexpected error occurred";
        toast.error(message);
        return Promise.reject(error);
    }
);

export default api;
