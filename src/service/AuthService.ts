import api from "./api.ts";
import type { User } from "../types/Auth.ts";

const BASE_PATH = "/auth";

export async function getMe(): Promise<User> {
    const res = await api.get(`${BASE_PATH}/me`);
    return res.data;
}

export async function login(username: string, password: string): Promise<void> {
    const res = await api.post(`${BASE_PATH}/login`, { username, password });
    return res.data;
}
