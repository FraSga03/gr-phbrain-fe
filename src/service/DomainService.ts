import api from "./api.ts";
import type { ClassNode } from "../types/ClassNode.ts";
import type { EvaluationCreateDTO } from "../schemas/EvaluationForm.ts";

const BASE_PATH = "/domains";

export async function getAll(): Promise<string[]> {
    const res = await api.get(`${BASE_PATH}/all`);
    return res.data;
}

export async function getSubclasses(domain: string, targetClass?: string): Promise<ClassNode> {
    const res = await api.get(`${BASE_PATH}/subclasses/${domain}/${targetClass ?? ''}`);
    return res.data;
}

export async function getInstanceByIdAndDomain(domain: string, id: string): Promise<any> {
    const res = await api.get(`${BASE_PATH}/${domain}/${id}`);
    return res.data;
}

export async function evaluateInstance(domain: string, id: string, dto: EvaluationCreateDTO) {
    const res = await api.post(`${BASE_PATH}/${domain}/${id}/evaluate`, dto);
    return res.data;
}

export async function saveInstance(domain: string, targetClass: string, dto: never) {
    const res = await api.post(`${BASE_PATH}/instance/${domain}/${targetClass}`, dto);
    return res.data;
}

export async function editInstance(domain: string, id: string, dto: EvaluationCreateDTO) {
    const res = await api.put(`${BASE_PATH}/instance/${domain}/${id}`, dto);
    return res.data;
}

export async function saveFile(domain: string, id: string, dto: FormData) {
    const res = await api.post(`${BASE_PATH}/instance/${domain}/${id}/file`, dto, {
        headers: dto instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    });
    return res.data;
}