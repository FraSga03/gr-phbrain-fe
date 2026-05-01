import type { Node, Edge } from "@xyflow/react";

export type GraphNodeData = {
    label: string;
    isPrimary: boolean;
    isDetail?: boolean;
};

export type GraphEdgeData = {
    isPrimary: boolean;
    isDetail?: boolean;
    offset?: number;
};

export type GraphNode = Node<GraphNodeData, "circular">;
export type GraphEdge = Edge<GraphEdgeData>;
