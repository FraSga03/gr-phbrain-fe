import { useState } from "react";
import {
    ReactFlow,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from "@xyflow/react";
import type { GraphNode, GraphEdge } from "../types/GraphFlow.ts";
import { circularNodeTypes } from "../utils/CircularNode.tsx";
import { parallelEdgeTypes } from "../utils/ParallelEdge.tsx";
import "@xyflow/react/dist/style.css";

type AlgorithmOption = { label: string; value: string };

type GraphCanvasProps = {
    nodes: GraphNode[];
    edges: GraphEdge[];
    onNodesChange: (changes: NodeChange<GraphNode>[]) => void;
    onEdgesChange: (changes: EdgeChange<GraphEdge>[]) => void;
    onConnect: (params: Connection) => void;
    onNodeSelect: (nodeId: string) => void;
    onEdgeSelect?: (edgeId: string) => void;
    centralityOptions: AlgorithmOption[];
    linkPredictionOptions: AlgorithmOption[];
    onCentralitySelect: (nodeId: string, algorithm: string) => void;
    onLinkPredictionSelect: (nodeId: string, algorithm: string) => void;
};

export default function GraphCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeSelect,
    onEdgeSelect,
    centralityOptions,
    linkPredictionOptions,
    onCentralitySelect,
    onLinkPredictionSelect,
}: GraphCanvasProps) {
    const [contextMenu, setContextMenu] = useState<
        { x: number; y: number; nodeId: string } | null
    >(null);

    return (
        <div className="relative h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={circularNodeTypes}
                edgeTypes={parallelEdgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => {
                    onNodeSelect(node.id);
                    setContextMenu(null);
                }}
                onEdgeClick={(_, edge) => {
                    onEdgeSelect?.(edge.id);
                    setContextMenu(null);
                }}
                onNodeContextMenu={(event, node) => {
                    event.preventDefault();
                    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    setContextMenu({
                        x: event.clientX - bounds.left,
                        y: event.clientY - bounds.top,
                        nodeId: node.id,
                    });
                }}
                onPaneClick={() => setContextMenu(null)}
                fitView
            />

            {contextMenu && (
                <div
                    className="absolute z-10 flex flex-col gap-1 py-1 rounded border border-gray-200 bg-white text-xs shadow"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="px-2 py-1 text-[10px] uppercase text-gray-500 border-b border-gray-200">
                        Centrality
                    </div>
                    <div className="flex flex-col gap-2 px-1">
                        {centralityOptions.map((opt) => (
                            <button
                                key={`centrality-${opt.value}`}
                                className="h-7! py-1! text-left hover:bg-gray-100"
                                onClick={() => {
                                    onCentralitySelect(contextMenu.nodeId, opt.value);
                                    setContextMenu(null);
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-2 py-1 text-[10px] uppercase text-gray-500 border-y border-gray-200">
                        Link Prediction
                    </div>
                    <div className="flex flex-col gap-2 px-1">
                        {linkPredictionOptions.map((opt) => (
                            <button
                                key={`link-${opt.value}`}
                                className="h-7! py-1! text-left hover:bg-gray-100"
                                onClick={() => {
                                    onLinkPredictionSelect(contextMenu.nodeId, opt.value);
                                    setContextMenu(null);
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
