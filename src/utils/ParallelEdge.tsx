import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { GraphEdgeData } from "../types/GraphFlow.ts";

const OFFSET_PX = 40;

export default function ParallelEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    style,
    labelStyle,
    data,
    markerEnd,
}: EdgeProps) {
    const offset = ((data as GraphEdgeData | undefined)?.offset ?? 0) * OFFSET_PX;

    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;

    const cx = (sourceX + targetX) / 2 + nx * offset;
    const cy = (sourceY + targetY) / 2 + ny * offset;

    let path: string;
    let labelX: number;
    let labelY: number;
    if (offset === 0) {
        const [bezierPath, bx, by] = getBezierPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
        });
        path = bezierPath;
        labelX = bx;
        labelY = by;
    } else {
        path = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;
        labelX = (sourceX + targetX) / 2 + nx * offset * 0.5;
        labelY = (sourceY + targetY) / 2 + ny * offset * 0.5;
    }

    return (
        <>
            <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
            {label != null && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: "all",
                            fontSize: 12,
                            background: "white",
                            padding: "0 4px",
                            borderRadius: 2,
                            ...(labelStyle ?? {}),
                        }}
                        className="nodrag nopan"
                    >
                        {typeof label === "object" && label !== null ? JSON.stringify(label) : (label as React.ReactNode)}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const parallelEdgeTypes = { parallel: ParallelEdge };
