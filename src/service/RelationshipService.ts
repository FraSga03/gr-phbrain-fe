import api from "./api.ts";
import type {
    DomainRelationships,
    PossibleRelationship,
    Relationship,
    RelationshipInstance
} from "../types/Relationship.ts";

const BASE_PATH = "/relationships";

export async function getPossibleRelationships(domain: string, sourceClass: string, targetClass?: string) {
    const res = await api.get<PossibleRelationship>(`${BASE_PATH}/${domain}/possible/list`, {
        params: {
            sourceClass, targetClass
        }
    });
    return res.data;
}

export async function getRelationshipById(domain: string, relationshipId: string) {
    const res = await api.get<Relationship>(`${BASE_PATH}/${domain}/${relationshipId}`);
    return res.data;
}

export async function getRelationshipInstance(domain: string, instanceId: string) {
    const res = await api.get<RelationshipInstance>(`${BASE_PATH}/${domain}/instance/${instanceId}`);
    return res.data;
}

export async function saveRelationship(domain: string, sourceId: string, targetId: string, payload: Record<string, unknown>) {
    const res = await api.post<RelationshipInstance>(`${BASE_PATH}/${domain}/instance/${sourceId}/${targetId}`, {
        description: "",
        date: new Date().toISOString(),
        property: payload
    });
    return res.data;
}

export async function editRelationship(domain: string, instanceId: string, payload: Record<string, unknown>) {
    const res = await api.put<RelationshipInstance>(`${BASE_PATH}/${domain}/instance/${instanceId}`, payload);
    return res.data;
}

export async function getAllRelationships(domain: string) {
    const res = await api.get<DomainRelationships>(`${BASE_PATH}/${domain}`);
    return res.data;
}