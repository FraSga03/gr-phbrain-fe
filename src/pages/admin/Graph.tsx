import { useState, useCallback, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type { GraphNode, GraphEdge } from "../../types/GraphFlow.ts";
import Card from "../../components/Card";
import { useGraph } from "../../contexts/GraphContext.tsx";
import type { Instance } from "../../types/Instance.ts";
import type { RelationshipInstance } from "../../types/Relationship.ts";
import { getInstanceByIdAndDomain } from "../../services/DomainService.ts";
import { useDomain } from "../../contexts/DomainContext.tsx";
import { getRelationshipInstance } from "../../services/RelationshipService.ts";
import type { Column } from "../../types/Table.ts";
import Table from "../../components/Table.tsx";
import { generateGraph, getNodeCentrality, getNodeLinkPrediction } from "../../services/GraphService.ts";
import GraphCanvas from "../../components/GraphCanvas.tsx";
import { assignParallelEdgeOffsets, layoutWithDagre } from "../../utils/graphLayout.ts";
import GraphProperties from "../../components/GraphProperties.tsx";
import { FaTrash } from "react-icons/fa";

export default function Graph() {
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);

    const {
        setSelectedInstances,
        setSelectedRelationships,
        selectedInstances,
        selectedRelationships,
        detailInstances: detailInstanceIds,
        setDetailInstances: setDetailInstanceIds,
        detailRelationships: detailRelationshipIds,
        setDetailRelationships: setDetailRelationshipIds,
    } = useGraph();
    const { selectedDomain } = useDomain();

    const [instances, setInstances] = useState<Instance[]>([]);
    const [relationshipInstances, setRelationshipInstances] = useState<RelationshipInstance[]>([]);
    const [detailInstances, setDetailInstances] = useState<Instance[]>([]);
    const [detailRelationshipInstances, setDetailRelationshipInstances] = useState<RelationshipInstance[]>([]);

    const [isPropertyOpen, setIsPropertyOpen] = useState<{ [key: string]: boolean }>({});
    const [centrality, setCentrality] = useState<{ [key: string]: number }>({});
    const [linkPrediction, setLinkPrediction] = useState<{ [key: string]: number }>({});
    const [centralityAlg, setCentralityAlg] = useState<{ [key: string]: string }>({});
    const [linkPredictionAlg, setLinkPredictionAlg] = useState<{ [key: string]: string }>({});

    const linkPredictionAlgorithmOptions = [
        { label: "Resource Allocation", value: "resourceAllocation" },
        { label: "Common Neighbors", value: "commonNeighbors" },
        { label: "Katz", value: "katz" },
        { label: "AdamicAdar", value: "adamicAdar" },
    ];

    const centralityAlgorithmOptions = [
        { label: "Closeness", value: "closeness" },
        { label: "Betweeness", value: "betweeness" },
        { label: "PageRank", value: "pageRank" },
        { label: "Harmonic", value: "harmonic" },
        { label: "Katz", value: "katz" },
    ];

    const onNodesChange = useCallback(
        (changes: NodeChange<GraphNode>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<GraphEdge>[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const instancesColumn: Column<Instance>[] = [
        { header: "Id", key: "__id" },
        { header: "Class", key: "class" },
        { header: "Name", key: "name" },
        { header: "", key: "empty", render: (_value, row) => (
            <FaTrash className="text-red-400 cursor-pointer" onClick={() => removeInstance(row.__id)} />
        )}
    ]

    const relationshipsColumn: Column<RelationshipInstance>[] = [
        { header: "Id", key: "__id" },
        { header: "Relationship", key: "name" },
        { header: "", key: "empty", render: (_value, row) => (
            <FaTrash className="text-red-400 cursor-pointer" onClick={() => removeRelationship(row.__id)} />
        )}
    ];

    function removeInstance(instanceId: string) {
        setSelectedInstances(selectedInstances.filter(s => s !== instanceId));
    }

    function removeRelationship(relationshipId: string) {
        setSelectedRelationships(selectedRelationships.filter(s => s !== relationshipId));
    }

    function onInstanceNodeClick(id: string) {
        if (!detailInstanceIds.includes(id)) {
            setDetailInstanceIds([...detailInstanceIds, id]);
        }
    }

    function onRelationshipEdgeClick(id: string) {
        if (!detailRelationshipIds.includes(id)) {
            setDetailRelationshipIds([...detailRelationshipIds, id]);
        }
    }

    function onCentralityAlgorithmSelect(instanceId: string, alg: string) {
        if (!selectedDomain) return;

        if (!detailInstanceIds.includes(instanceId)) {
            setDetailInstanceIds([...detailInstanceIds, instanceId]);
        }
        setCentralityAlg((prev) => ({ ...prev, [instanceId]: alg }));

        getNodeCentrality(selectedDomain, instanceId, alg)
            .then((res) => setCentrality((prev) => ({ ...prev, [instanceId]: res })));
    }

    function onLinkPredictionAlgorithmSelection(instanceId: string, alg: string) {
        if (!selectedDomain) return;

        if (!detailInstanceIds.includes(instanceId)) {
            setDetailInstanceIds([...detailInstanceIds, instanceId]);
        }
        setLinkPredictionAlg((prev) => ({ ...prev, [instanceId]: alg }));

        getNodeLinkPrediction(selectedDomain, instanceId, alg)
            .then((res) => setLinkPrediction((prev) => ({ ...prev, [instanceId]: res })));
    }

    useEffect(() => {
        if (!selectedDomain) return;
        if (!selectedInstances.length && !selectedRelationships.length) {
            setNodes([]);
            setEdges([]);
            return;
        }

        generateGraph(selectedDomain, selectedInstances, selectedRelationships)
            .then(res => {
                const rawNodes: GraphNode[] = res.nodes.map((i) => ({
                    id: i.id,
                    type: "circular",
                    position: { x: 0, y: 0 },
                    data: {
                        label: i.label,
                        isPrimary: selectedInstances.includes(i.id),
                        isDetail: detailInstanceIds.includes(i.id),
                    },
                }));

                const rawEdges: GraphEdge[] = res.edges.map((e) => {
                    const isPrimary = selectedRelationships.includes(e.id);
                    const isDetail = detailRelationshipIds.includes(e.id);
                    const stroke: string | undefined = isDetail ? "#7dd3fc" : isPrimary ? "var(--accent)" : undefined;
                    return {
                        id: e.id,
                        source: e.source,
                        target: e.target,
                        label: e.label,
                        style: stroke ? { stroke, strokeWidth: 2 } : undefined,
                        labelStyle: stroke ? { fill: stroke } : undefined,
                        data: { isPrimary, isDetail },
                    };
                });

                setNodes(layoutWithDagre(rawNodes, rawEdges));
                setEdges(assignParallelEdgeOffsets(rawEdges));
            });
    }, [selectedInstances, selectedRelationships]);

    useEffect(() => {
        setNodes((prev) => prev.map((n) => ({
            ...n,
            data: { ...n.data, isDetail: detailInstanceIds.includes(n.id) },
        })));
    }, [detailInstanceIds]);

    useEffect(() => {
        setEdges((prev) => prev.map((e): GraphEdge => {
            const isPrimary = !!e.data?.isPrimary;
            const isDetail = detailRelationshipIds.includes(e.id);
            const stroke: string | undefined = isDetail ? "#7dd3fc" : isPrimary ? "var(--accent)" : undefined;
            return {
                ...e,
                style: stroke ? { stroke, strokeWidth: 2 } : undefined,
                labelStyle: stroke ? { fill: stroke } : undefined,
                data: { isPrimary, isDetail, offset: e.data?.offset },
            };
        }));
    }, [detailRelationshipIds]);

    useEffect(() => {
        if (!selectedDomain) return;

        Promise.all(
            selectedInstances.map((id) => getInstanceByIdAndDomain(selectedDomain, id)),
        ).then((fetched) => setInstances(fetched));
    }, [selectedInstances, selectedDomain]);

    useEffect(() => {
        if (!selectedDomain) return;

        Promise.all(
            selectedRelationships.map((id) => getRelationshipInstance(selectedDomain, id)),
        ).then((fetched) => setRelationshipInstances(fetched));
    }, [selectedRelationships, selectedDomain]);

    useEffect(() => {
        if (!selectedDomain) return;

        Promise.all(
            detailInstanceIds.map((id) => getInstanceByIdAndDomain(selectedDomain, id)),
        ).then((fetched) => setDetailInstances(fetched));
    }, [detailInstanceIds, selectedDomain]);

    useEffect(() => {
        if (!selectedDomain) return;

        Promise.all(
            detailRelationshipIds.map((id) => getRelationshipInstance(selectedDomain, id)),
        ).then((fetched) => setDetailRelationshipInstances(fetched));
    }, [detailRelationshipIds, selectedDomain]);

    return (
        <div className="grid grid-cols-10 h-full">
            <Card className="col-span-2" title="Selected Nodes" scrollable>
                {
                    !selectedRelationships.length && !selectedInstances.length ?
                        <div>Select first some relationships or instance in relationships or entities page</div> :
                        <div className="flex flex-col gap-3">
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
                <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeSelect={onInstanceNodeClick}
                    onEdgeSelect={onRelationshipEdgeClick}
                    centralityOptions={centralityAlgorithmOptions}
                    linkPredictionOptions={linkPredictionAlgorithmOptions}
                    onCentralitySelect={onCentralityAlgorithmSelect}
                    onLinkPredictionSelect={onLinkPredictionAlgorithmSelection}
                />
            </div>

            <GraphProperties
                className="col-span-2"
                detailInstances={detailInstances}
                detailRelationshipInstances={detailRelationshipInstances}
                onRemoveInstance={(id) => setDetailInstanceIds(detailInstanceIds.filter((i) => i !== id))}
                onRemoveRelationship={(id) => setDetailRelationshipIds(detailRelationshipIds.filter((r) => r !== id))}
                onExpandInstance={(id) => setSelectedInstances([...selectedInstances, id])}
                isPropertyOpen={isPropertyOpen}
                setIsPropertyOpen={setIsPropertyOpen}
                centrality={centrality}
                linkPrediction={linkPrediction}
                centralityAlg={centralityAlg}
                linkPredictionAlg={linkPredictionAlg}
                centralityOptions={centralityAlgorithmOptions}
                linkPredictionOptions={linkPredictionAlgorithmOptions}
                onCentralitySelect={onCentralityAlgorithmSelect}
                onLinkPredictionSelect={onLinkPredictionAlgorithmSelection}
            />

        </div>
    );
}