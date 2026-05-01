import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GraphNodeData } from "../types/GraphFlow.ts";

export default function CircularNode({ data }: NodeProps) {
    const d = data as GraphNodeData;
    const colorClass = d.isDetail
        ? 'bg-sky-300 text-black'
        : d.isPrimary
            ? 'bg-accent text-white'
            : 'bg-white text-black';
    return (
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-700 text-center text-[10px] leading-tight shadow ${colorClass}`}>
            <Handle type="target" position={Position.Left} />
            {typeof d.label === "object" && d.label !== null ? JSON.stringify(d.label) : String(d.label ?? "")}
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

export const circularNodeTypes = { circular: CircularNode };
