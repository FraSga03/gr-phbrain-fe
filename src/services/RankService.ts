import api from "./api.ts";
import type { Credit, Contribution, UserRank } from "../types/Dashboard.ts";
import type { PaginatedResult } from "../types/Paginate.ts";

const BASE_PATH = "/rank";

// GET user's contributions
export async function getUserContributions(): Promise<Contribution[]> {
    const res = await api.get(`${BASE_PATH}/contribution/me`);
    return res.data;
}

// GET user's credit
export async function getUserCredit(): Promise<Credit> {
    const res = await api.get(`${BASE_PATH}/credit/me`);
    return res.data;
}

// POST get users ranking
export async function getUserRanking(page = 1, limit = 10): Promise<PaginatedResult<UserRank>> {
    const res = await api.post(`${BASE_PATH}/users`, { page, limit });
    return res.data;
}