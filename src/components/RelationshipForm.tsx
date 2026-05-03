import { useEffect, useMemo, useState } from "react";
import type { ClassNode } from "../types/ClassNode";
import { editRelationship, getPossibleRelationships, getRelationshipById, getRelationshipInstance, saveRelationship } from "../services/RelationshipService.ts";
import type { Option } from "../types/Select.ts";
import Select from "./Select.tsx";
import type { Relationship, RelationshipInstance } from "../types/Relationship.ts";
import InputField from "./InputField.tsx";
import Button from "./Button.tsx";
import { useForm, type FieldError } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useGraph } from "../contexts/GraphContext.tsx";

type RelationshipFormProps = {
    subject: ClassNode;
    object: ClassNode | undefined;
    domain: string
    relationshipId: string | null,
    onRelationshipSelect: (subject: Relationship) => void;
    subjectId: string | null;
    objectId: string | null;
    instanceId: string | null;
    onInstanceSelect: (instanceId: string) => void;
};

export default function RelationshipForm({ subject, object, domain, onRelationshipSelect, relationshipId, instanceId, onInstanceSelect, subjectId, objectId }: RelationshipFormProps) {

    const navigate = useNavigate();
    const location = useLocation();
    const { selectedRelationships: graphSelectedRelationships } = useGraph();

    const goToGraphWithRelationship = (relationshipInstanceId: string | null) => {
        if (!relationshipInstanceId) return;
        const next = graphSelectedRelationships.includes(relationshipInstanceId)
            ? graphSelectedRelationships
            : [...graphSelectedRelationships, relationshipInstanceId];
        const qParams = new URLSearchParams(location.search);
        qParams.set("graphSelectedRelationships", next.join(","));
        navigate(`/admin/graph?${qParams.toString()}`);
    };

    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);

    const [currentRelationship, setCurrentRelationship] = useState<Relationship | null>(null);
    const currentRelationshipOptions: Option[] = useMemo(() => {
        return currentRelationship?.instances?.map((inst: RelationshipInstance) => ({ value: inst.__id, label: `${inst.subject.name} - ${inst.subject.__id} -> ${inst.object.name} - ${inst.object.__id}`})) ?? []
    }, [currentRelationship])

    const [selectedInstance, setSelectedInstance] = useState<RelationshipInstance | null>(null);

    const {
        register,
        reset,
        handleSubmit,
        formState: { isSubmitting, errors }
    } = useForm<Record<string, unknown>>({
        defaultValues: {},
        mode: "onBlur",
    });

    useEffect(() => {
        getPossibleRelationships(domain, subject.name, object?.name).then((data) => {
            setRelationshipOptions(
                data.relationships.map((r: Relationship) => ({ label: r.name, value: r.name }))
            );
            setRelationships(data.relationships as Relationship[]);
        })
    }, [subject, object]);

    function onRelationshipOptionSelected(rName: string) {
        onRelationshipSelect(relationships.find(r => r.name === rName)!);
    }

    useEffect(() => {
        if (relationshipId && instanceId) {
            getRelationshipInstance(domain, instanceId).then((data: RelationshipInstance) => {
                setSelectedInstance(data);
                reset(data.properties);
            });
        } else {
            setSelectedInstance(null);
            reset({});
        }
    }, [instanceId]);

    useEffect(() => {
        if (relationshipId) {
            getRelationshipById(domain, relationshipId).then((data: Relationship) => {
                setCurrentRelationship(data);
            })
        }

    }, [relationshipId]);

    useEffect(() => {
        setSelectedInstance(null);
        const empty = Object.fromEntries(
            Object.keys(currentRelationship?.properties ?? {}).map((k) => [k, ""])
        );
        reset(empty);
    }, [subjectId, objectId, currentRelationship]);

    const isCreateMode = Boolean(subjectId || objectId);

    async function onSubmit(data: Record<string, unknown>) {
        if (isCreateMode && subjectId && objectId) {
            await saveRelationship(domain, subjectId, objectId, data);
            toast.success("Relationship created");
        } else if (selectedInstance) {
            await editRelationship(domain, selectedInstance.__id, data);
            toast.success("Relationship updated");
        }
    }

    function onReset() {
        if (selectedInstance) {
            reset(selectedInstance.properties);
        } else {
            reset({});
        }
    }

    return (
        <div>
            {
                relationshipOptions.length > 0 &&
                <div className="flex flex-col gap-4">
                    <div className="grid grid-flow-row gap-2">
                        <div className="text-accent text-lg font-semibold leading-none">
                            Select a relationship
                        </div>
                        <Select
                            options={relationshipOptions}
                            placeholder="Select a relationship"
                            onChange={onRelationshipOptionSelected}
                            value={relationshipId ?? undefined}
                        />
                    </div>

                    {!isCreateMode && (
                        <div className="grid grid-flow-row gap-2">
                            <div className="text-accent text-lg font-semibold leading-none">
                                Select an instance
                            </div>

                            {currentRelationship && currentRelationshipOptions.length === 0 ? (
                                <div>
                                    No instances available for this relationship
                                </div>
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <Select
                                            options={currentRelationshipOptions}
                                            placeholder="Select a relationship instance"
                                            onChange={onInstanceSelect}
                                            value={instanceId ?? undefined}
                                            disabled={!currentRelationship}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        disabled={!instanceId}
                                        onClick={() => goToGraphWithRelationship(instanceId)}
                                    >
                                        Graph
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}


                    <div className="text-accent text-lg font-semibold leading-none">
                        Properties
                    </div>

                    {currentRelationship && (isCreateMode || selectedInstance) ? (
                        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
                            {Object.keys(currentRelationship?.properties ?? {}).length === 0 && (
                                <div className="col-span-2">
                                    This relationship has no property
                                </div>
                            )}
                            {Object.entries(currentRelationship?.properties ?? {}).map(([key, config]) => (
                                <div key={key}>
                                    {config.type === "string" || config.type === "number" || config.type === "date" ? (
                                        <InputField
                                            label={`${key}${config.required ? ' *' : ''}`}
                                            type={config.type === "date" ? "date" : config.type}
                                            registration={register(key, { required: config.required ? `${key} is required` : false })}
                                            error={errors[key] as FieldError | undefined}
                                            size="md"
                                        />
                                    ) : Array.isArray(config.type) ? (
                                        <div className="flex flex-col gap-0.5">
                                            <label className="label text-lg!">{key}{config.required ? ' *' : ''}</label>
                                            <Select
                                                options={config.type.map((opt) => ({ label: opt, value: opt }))}
                                                placeholder={`Select ${key}`}
                                                registration={register(key, { required: config.required ? `${key} is required` : false })}
                                                className="h-10"
                                                error={errors[key] as FieldError | undefined}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            <div className="flex justify-end gap-2 col-span-2">
                                {Object.keys(currentRelationship?.properties ?? {}).length > 0 && (
                                    <Button type="button" onClick={onReset} disabled={isSubmitting} variant="secondary">
                                        Reset
                                    </Button>
                                )}
                                <Button type="submit" disabled={isSubmitting || (isCreateMode && !(subjectId && objectId))}>
                                    {isSubmitting ? "Loading..." : isCreateMode ? "Save" : "Edit"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div>Select an instance to edit or select a class</div>
                    )}
                </div>
            }

            { !relationshipOptions.length &&
                <div>
                    There are no relationships between these classes
                </div>
            }
        </div>
    );
}
