import { useState, useCallback, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange } from '@xyflow/react';
import Card from "../../components/Card";
import { useGraph } from "../../context/GraphContext.tsx";
import type { Instance } from "../../types/Instance.ts";
import type { RelationshipInstance } from "../../types/Relationship.ts";
import { getInstanceByIdAndDomain } from "../../service/DomainService.ts";
import { useDomain } from "../../context/DomainContext.tsx";
import { getRelationshipInstance } from "../../service/RelationshipService.ts";
import type { Column } from "../../types/Table.ts";
import Table from "../../components/Table.tsx";
import { generateGraph, getNodeCentrality, getNodeLinkPrediction } from "../../service/GraphService.ts";
import GraphCanvas, { layoutWithDagre } from "../../components/GraphCanvas.tsx";
import GraphProperties from "../../components/GraphProperties.tsx";
import { FaTrash } from "react-icons/fa";

export default function Graph() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);

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
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
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
        setSelectedInstances(selectedRelationships.filter(s => s !== relationshipId));
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

    useEffect(() => {
        if (!selectedDomain) return;
        if (!selectedInstances.length && !selectedRelationships.length) return;

        generateGraph(selectedDomain, selectedInstances, selectedRelationships)
            .then(res => {
                const rawNodes = res.nodes.map((i) => ({
                    id: i.id,
                    type: "circular",
                    position: { x: 0, y: 0 },
                    data: { label: i.label, isPrimary: selectedInstances.includes(i.id) },

                }));

                const rawEdges = res.edges.map((e) => {
                    const isPrimary = selectedRelationships.includes(e.id);
                    return {
                        id: e.id,
                        source: e.source,
                        target: e.target,
                        label: e.label,
                        style: isPrimary
                            ? { stroke: "var(--accent)", strokeWidth: 2 }
                            : undefined,
                        labelStyle: isPrimary ? { fill: "var(--accent)" } : undefined,
                        data: { isPrimary },
                    };
                });

                setNodes(layoutWithDagre(rawNodes, rawEdges));
                setEdges(rawEdges);
            });
    }, [selectedInstances, selectedRelationships]);

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

    function onCentralityAlgorithmSelect(instanceId: string, alg: string) {
        if (!selectedDomain) return;

        getNodeCentrality(selectedDomain, instanceId, alg)
            .then((res) => setCentrality({ ...centrality, [instanceId]: res }));
    }

    function onLinkPredictionAlgorithmSelection(instanceId: string, alg: string) {
        if (!selectedDomain) return;

        getNodeLinkPrediction(selectedDomain, instanceId, alg)
            .then((res) => setLinkPrediction({ ...linkPrediction, [instanceId]: res }));
    }

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
                isPropertyOpen={isPropertyOpen}
                setIsPropertyOpen={setIsPropertyOpen}
                centrality={centrality}
                linkPrediction={linkPrediction}
                centralityOptions={centralityAlgorithmOptions}
                linkPredictionOptions={linkPredictionAlgorithmOptions}
                onCentralitySelect={onCentralityAlgorithmSelect}
                onLinkPredictionSelect={onLinkPredictionAlgorithmSelection}
            />

        </div>
    );
}