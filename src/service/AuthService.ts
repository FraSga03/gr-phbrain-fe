import api, { TOKEN_STORAGE_KEY } from "./api.ts";
import type { User } from "../types/Auth.ts";

const BASE_PATH = "/auth";

export async function getMe(): Promise<User> {
    const res = await api.get(`${BASE_PATH}/me`);
    return res.data;
}

export async function login(username: string, password: string): Promise<string> {
    const res = await api.post<string>(`${BASE_PATH}/login`, { username, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, res.data);
    return res.data;
}

export function logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await api.post(`${BASE_PATH}/change-password`, { currentPassword, newPassword });
    return res.data;
}
