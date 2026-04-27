import { useState } from "react";
import {
    ReactFlow,
    Handle,
    Position,
    type NodeProps,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";

const NODE_WIDTH = 40;
const NODE_HEIGHT = 40;

export function layoutWithDagre(
    nodes: any[],
    edges: any[],
    direction: "TB" | "LR" = "TB",
) {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 90 });

    nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach((e) => g.setEdge(e.source, e.target));

    Dagre.layout(g);

    return nodes.map((n) => {
        const { x, y } = g.node(n.id);
        return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } };
    });
}

function CircularNode({ data }: NodeProps) {
    return (
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-700 text-center text-[10px] leading-tight shadow
        ${(data as { isPrimary: boolean }).isPrimary ? 'bg-accent text-white' : 'bg-white text-black' }`}>
            <Handle type="target" position={Position.Top} />
            {(data as { label: string }).label }
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

const nodeTypes = { circular: CircularNode };

type AlgorithmOption = { label: string; value: string };

type GraphCanvasProps = {
    nodes: any[];
    edges: any[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
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
                nodeTypes={nodeTypes}
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
                    className="absolute z-10 flex flex-col rounded border border-gray-200 bg-white text-xs shadow"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="px-2 py-1 text-[10px] uppercase text-gray-500 border-b border-gray-200">
                        Centrality
                    </div>
                    {centralityOptions.map((opt) => (
                        <button
                            key={`centrality-${opt.value}`}
                            className="px-2 py-1 text-left hover:bg-gray-100"
                            onClick={() => {
                                onCentralitySelect(contextMenu.nodeId, opt.value);
                                setContextMenu(null);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}

                    <div className="px-2 py-1 text-[10px] uppercase text-gray-500 border-y border-gray-200">
                        Link Prediction
                    </div>
                    {linkPredictionOptions.map((opt) => (
                        <button
                            key={`link-${opt.value}`}
                            className="px-2 py-1 text-left hover:bg-gray-100"
                            onClick={() => {
                                onLinkPredictionSelect(contextMenu.nodeId, opt.value);
                                setContextMenu(null);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
