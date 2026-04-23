import api from "./api.ts";

const BASE_PATH = "/help";

// POST save suggestion
export async function saveSuggestion(suggestion: string): Promise<void> {
    const res = await api.post(`${BASE_PATH}/suggestion`, { suggestion });
    return res.data;
}