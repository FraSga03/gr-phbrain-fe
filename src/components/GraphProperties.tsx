import { Fragment } from "react";
import { FaXmark } from "react-icons/fa6";
import Card from "./Card.tsx";
import Button from "./Button.tsx";
import Select from "./Select.tsx";
import type { Instance } from "../types/Instance.ts";
import type { RelationshipInstance } from "../types/Relationship.ts";

type AlgorithmOption = { label: string; value: string };

type GraphPropertiesProps = {
    detailInstances: Instance[];
    detailRelationshipInstances: RelationshipInstance[];
    onRemoveInstance: (id: string) => void;
    onRemoveRelationship: (id: string) => void;
    isPropertyOpen: { [key: string]: boolean };
    setIsPropertyOpen: (next: { [key: string]: boolean }) => void;
    centrality: { [key: string]: number };
    linkPrediction: { [key: string]: number };
    centralityOptions: AlgorithmOption[];
    linkPredictionOptions: AlgorithmOption[];
    onCentralitySelect: (instanceId: string, algorithm: string) => void;
    onLinkPredictionSelect: (instanceId: string, algorithm: string) => void;
    className?: string;
};

export default function GraphProperties({
    detailInstances,
    detailRelationshipInstances,
    onRemoveInstance,
    onRemoveRelationship,
    isPropertyOpen,
    setIsPropertyOpen,
    centrality,
    linkPrediction,
    centralityOptions,
    linkPredictionOptions,
    onCentralitySelect,
    onLinkPredictionSelect,
    className,
}: GraphPropertiesProps) {
    const empty = !detailInstances.length && !detailRelationshipInstances.length;

    return (
        <Card className={className} title="Properties" scrollable>
            {empty ? (
                <div className="text-sm">Select an instance or a relationship to see its properties</div>
            ) : (
                <div className="flex flex-col gap-6">
                    {!!detailInstances.length && (
                        <div className="flex flex-col gap-2">
                            <div className="text-lg">Instances</div>
                            {detailInstances.map((instance) => (
                                <div key={instance.__id} className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-accent">
                                            <span className="font-semibold">{instance.class}</span>{" "}
                                            <span>{(instance as { name?: string }).name ?? ""}</span>{" "}
                                        </div>
                                        <FaXmark
                                            className="cursor-pointer text-gray-500"
                                            onClick={() => onRemoveInstance(instance.__id)}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => {}}>
                                            <div className="text-xs">Expand Neighbors</div>
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setIsPropertyOpen({
                                                    ...isPropertyOpen,
                                                    [instance.__id]: !isPropertyOpen[instance.__id],
                                                })
                                            }
                                        >
                                            <div className="text-xs">
                                                {isPropertyOpen[instance.__id] ? "Hide" : "Show"} Properties
                                            </div>
                                        </Button>
                                    </div>

                                    {isPropertyOpen[instance.__id] && (
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                            {Object.entries(instance)
                                                .filter(([k]) => !["__id", "name", "class", "attachments"].includes(k))
                                                .map(([k, v]) => (
                                                    <Fragment key={k}>
                                                        <div className="font-semibold">{k}</div>
                                                        <div className="wrap-break-word">
                                                            {v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                                                        </div>
                                                    </Fragment>
                                                ))}
                                        </div>
                                    )}

                                    <hr className="border-gray-200" />

                                    <div className="text-accent text-lg">Analytics</div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm flex-1">Centrality Algorithms</label>
                                                <Select
                                                    className="h-8 w-32"
                                                    options={centralityOptions}
                                                    placeholder="Select one"
                                                    onChange={(k) => onCentralitySelect(instance.__id, k)}
                                                />
                                            </div>

                                            {centrality[instance.__id] !== undefined && (
                                                <div className="flex justify-between items-cente">
                                                    <span>Result:</span>
                                                    {centrality[instance.__id]}
                                                </div>
                                            )}
                                        </div>

                                        <hr className="border-gray-200" />

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm flex-1">Link Prediction Algorithms</label>
                                                <Select
                                                    className="h-8 w-32"
                                                    options={linkPredictionOptions}
                                                    placeholder="Select one"
                                                    onChange={(k) => onLinkPredictionSelect(instance.__id, k)}
                                                />
                                            </div>

                                            {linkPrediction[instance.__id] !== undefined && (
                                                <div className="flex justify-between items-center">
                                                    <span>Result:</span>
                                                    {linkPrediction[instance.__id]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!!detailRelationshipInstances.length && (
                        <div className="flex flex-col gap-2">
                            <div className="text-lg">Relationships</div>
                            {detailRelationshipInstances.map((rel) => (
                                <div key={rel.__id} className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-accent">
                                            <span className="font-semibold">
                                                {(rel as { name?: string }).name} - {rel.__id}
                                            </span>
                                        </div>
                                        <FaXmark
                                            className="cursor-pointer text-gray-500"
                                            onClick={() => onRemoveRelationship(rel.__id)}
                                        />
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            setIsPropertyOpen({
                                                ...isPropertyOpen,
                                                [rel.__id]: !isPropertyOpen[rel.__id],
                                            })
                                        }
                                    >
                                        <div className="text-xs">
                                            {isPropertyOpen[rel.__id] ? "Hide" : "Show"} Properties
                                        </div>
                                    </Button>

                                    {isPropertyOpen[rel.__id] && (
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                            {Object.entries((rel as { properties?: Record<string, unknown> }).properties ?? {}).map(([k, v]) => (
                                                <Fragment key={k}>
                                                    <div className="font-semibold">{k}</div>
                                                    <div className="wrap-break-word">
                                                        {v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v)}
                                                    </div>
                                                </Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
