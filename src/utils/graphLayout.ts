import Dagre from "@dagrejs/dagre";
import type { GraphNode, GraphEdge } from "../types/GraphFlow.ts";

const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;

export function layoutWithDagre(
    nodes: GraphNode[],
    edges: GraphEdge[],
    direction: "TB" | "LR" = "LR",
): GraphNode[] {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 160 });

    nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach((e) => g.setEdge(e.source, e.target));

    Dagre.layout(g);

    return nodes.map((n) => {
        const { x, y } = g.node(n.id);
        return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } };
    });
}

export function assignParallelEdgeOffsets(edges: GraphEdge[]): GraphEdge[] {
    const groups = new Map<string, GraphEdge[]>();
    edges.forEach((e) => {
        const a = e.source < e.target ? e.source : e.target;
        const b = e.source < e.target ? e.target : e.source;
        const key = `${a}::${b}`;
        const arr = groups.get(key) ?? [];
        arr.push(e);
        groups.set(key, arr);
    });

    const offsets = new Map<string, number>();
    groups.forEach((group) => {
        if (group.length <= 1) {
            offsets.set(group[0].id, 0);
            return;
        }
        const baseDir = group[0].source < group[0].target ? 1 : -1;
        group.forEach((edge, i) => {
            const centered = i - (group.length - 1) / 2;
            const sign = edge.source < edge.target ? baseDir : -baseDir;
            offsets.set(edge.id, centered * sign);
        });
    });

    return edges.map((e): GraphEdge => ({
        ...e,
        type: "parallel",
        data: {
            isPrimary: e.data?.isPrimary ?? false,
            isDetail: e.data?.isDetail,
            offset: offsets.get(e.id) ?? 0,
        },
    }));
}
