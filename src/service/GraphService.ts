import api from "./api.ts";
import type { Graph } from "../types/Graph.ts";

const BASE_PATH = "/graphs";

export async function getNodeCentrality(domain: string, instanceId: string, algorithm: string) {
    const res = await api.get<number>(`${BASE_PATH}/${domain}/centrality/${instanceId}/${algorithm}`);
    return res.data;
}

export async function getNodeLinkPrediction(domain: string, instanceId: string, algorithm: string) {
    const res = await api.get<number>(`${BASE_PATH}/${domain}/link-prediction/${instanceId}/${algorithm}`);
    return res.data;
}

export async function generateGraph(domain: string, instanceIds: string[] = [], relationshipIds: string[] = []) {
    const res = await api.post<Graph>(`${BASE_PATH}/${domain}`, {
        instanceIds,
        relationshipIds,
    });
    return res.data;
}
