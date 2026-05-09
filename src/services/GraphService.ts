import api from "./api.ts";
import type { Graph } from "../types/Graph.ts";

const BASE_PATH = "/graphs";

export async function getNodeCentrality(domain: string, instanceId: string, algorithm: string, args: Record<string, unknown> = {}) {
    const res = await api.post<number>(`${BASE_PATH}/${domain}/centrality/${instanceId}/${algorithm}`, args);
    return res.data;
}

export async function getNodeLinkPrediction(domain: string, instanceId: string, algorithm: string, args: Record<string, unknown> = {}) {
    const res = await api.post<number>(`${BASE_PATH}/${domain}/link-prediction/${instanceId}/${algorithm}`, args);
    return res.data;
}

export async function generateGraph(domain: string, instanceIds: string[] = [], relationshipIds: string[] = []) {
    const res = await api.post<Graph>(`${BASE_PATH}/${domain}`, {
        instanceIds,
        relationshipIds,
    });
    return res.data;
}

export async function downloadGraph(dto: FormData) {
    const res = await api.post<Blob>(`${BASE_PATH}/download/file`, dto, {
        headers: dto instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
        responseType: "blob",
    });
    return res.data;
}