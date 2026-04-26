import { useState, useCallback, useEffect, Fragment } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Handle, Position, type NodeChange, type EdgeChange, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Card from "../../components/Card";
import { useGraph } from "../../context/GraphContext.tsx";
import type { Instance } from "../../types/Instance.ts";
import type { RelationshipInstance } from "../../types/Relationship.ts";
import { getInstanceByIdAndDomain } from "../../service/DomainService.ts";
import { useDomain } from "../../context/DomainContext.tsx";
import { getRelationshipInstance } from "../../service/RelationshipService.ts";
import type { Column } from "../../types/Table.ts";
import Table from "../../components/Table.tsx";
import Button from "../../components/Button.tsx";
import Select from "../../components/Select.tsx";
import { FaXmark } from "react-icons/fa6";

function CircularNode({ data }: NodeProps) {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-700 bg-white text-center text-sm shadow">
            <Handle type="target" position={Position.Top} />
            {(data as { label: string }).label}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}


// const initialNodes = [
//     {id: 'n1', type: 'circular', position: {x: 0, y: 0}, data: {label: 'Node 1'}},
//     {id: 'n2', type: 'circular', position: {x: 0, y: 150}, data: {label: 'Node 2'}},
// ];
// const initialEdges = [{id: 'n1-n2', source: 'n1', target: 'n2'}];

export default function Graph() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const nodeTypes = { circular: CircularNode };
    const { setSelectedInstances, selectedInstances, selectedRelationships, setSelectedRelationships } = useGraph();
    const { selectedDomain } = useDomain();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [relationshipInstances, setRelationshipInstances] = useState<RelationshipInstance[]>([]);
    const [isPropertyOpen, setIsPropertyOpen] = useState<{ [key: string]: boolean }>({});

    const onNodesChange = useCallback(
        (changes: NodeChange<{
            id: string;
            type: string;
            position: { x: number; y: number; };
            data: { label: string; };
        }>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<{ id: string; source: string; target: string; }>[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const instancesColumn: Column<Instance>[] = [
        { header: "Id", key: "__id" },
        { header: "Class", key: "class" },
        { header: "Name", key: "name" },
    ]

    const relationshipsColumn: Column<RelationshipInstance>[] = [
        { header: "Id", key: "__id" },
        { header: "Relationship", key: "name" },
    ]

    useEffect(() => {
        if (!selectedDomain) {
            return;
        }

        for (const selectedInstance of selectedInstances) {
            getInstanceByIdAndDomain(selectedDomain, selectedInstance).then((instance: Instance) => {
                setInstances([...instances, instance]);
            });
        }
    }, [selectedInstances]);

    useEffect(() => {
        if (!selectedDomain) {
            return;
        }

        for (const selectedRelationship of selectedRelationships) {
            getRelationshipInstance(selectedDomain, selectedRelationship).then((rel: RelationshipInstance) => {
                console.log("e")
                setRelationshipInstances([...relationshipInstances, rel]);
            });
        }
    }, [selectedRelationships]);

    return (
        <div className="grid grid-cols-10 h-full">
            <Card className="col-span-2" title="Selected Nodes" scrollable>
                {
                    !selectedRelationships.length && !selectedInstances.length ?
                        <div>Select first some relationships or instance in relationships or entities page</div> :
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="text-lg">Instances</div>

                                { !instances.length && <div className="text-sm">No instances found</div> }

                                { !!instances.length &&
                                    <Table
                                        columns={instancesColumn}
                                        data={instances}
                                    />
                                }
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="text-lg">Relationships</div>

                                { !relationshipInstances.length && <div className="text-sm">No relationship instances found</div> }

                                { !!relationshipInstances.length &&
                                    <Table
                                        columns={relationshipsColumn}
                                        data={relationshipInstances}
                                    />
                                }
                            </div>
                        </div>
                }
            </Card>

            <div className="h-full w-full col-span-6">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                />
            </div>

            <Card className="col-span-2" title="Properties" scrollable>
                {!instances.length ? (
                    <div className="text-sm">Select an instance to see its properties</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {instances.map((instance) => (
                            <div key={instance.__id} className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="text-accent">
                                        <span className="font-semibold">{instance.class}</span>{" "}
                                        <span>{(instance as { name?: string }).name ?? ""}</span>{" "}
                                    </div>
                                    <FaXmark
                                        className="cursor-pointer text-gray-500"
                                        onClick={() => {
                                            setSelectedInstances(selectedInstances.filter((id) => id !== instance.__id));
                                            setInstances(instances.filter((i) => i.__id !== instance.__id));
                                        }}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => {}}>
                                        <div className="text-xs">
                                            Expand Neighbors
                                        </div>
                                    </Button>
                                    <Button size="sm" onClick={() => { setIsPropertyOpen({...isPropertyOpen, [instance.__id] : !isPropertyOpen[instance.__id]}) }}>
                                        <div className="text-xs">
                                            { isPropertyOpen[instance.__id] ? "Hide": "Show" } Properties
                                        </div>
                                    </Button>
                                </div>

                                {
                                    isPropertyOpen[instance.__id] &&
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                        {
                                            Object.entries(instance)
                                                .filter(([k]) => !["__id", "name", "class", "attachments"].includes(k))
                                                .map(([k, v]) => (
                                                    <Fragment key={k}>
                                                        <div className="font-semibold">{k}</div>
                                                        <div className="wrap-break-word">{v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
                                                    </Fragment>
                                                ))
                                        }
                                    </div>
                                }

                                <hr className="border-gray-200" />

                                <div className="text-accent text-lg">Analytics</div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm flex-1">Centrality Algorithms</label>
                                        <Select className="h-8 w-32" options={[
                                            { label: "Closeness", value: "closeness" },
                                            { label: "Betweeness", value: "betweeness" },
                                            { label: "PageRank", value: "pageRank" },
                                            { label: "Harmonic", value: "harmonic" },
                                            { label: "Katz", value: "katz" },
                                        ]} placeholder="Select one" onChange={() => { /* */ }} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm flex-1">Link Prediction Algorithms</label>
                                        <Select className="h-8 w-32" options={[
                                            { label: "Resource Allocation", value: "resourceAllocation" },
                                            { label: "Common Neighbors", value: "commonNeighbors" },
                                            { label: "Katz", value: "katz" },
                                            { label: "AdamicAdar", value: "adamicAdar" },
                                        ]} placeholder="Select one" onChange={() => { /* */ }} />                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}