import api from "./api.ts";

const BASE_PATH = "/relationships";

export async function getPossibleRelationships(domain: string, sourceClass: string, targetClass?: string) {
    const res = await api.get(`${BASE_PATH}/${domain}/relationships/possible`, {
        params: {
            sourceClass, targetClass
        }
    });
    return res.data;
}

export async function getRelationshipId(domain: string, relationshipId: string) {
    const res = await api.get(`${BASE_PATH}/${domain}/relationship/${relationshipId}`);
    return res.data;
}