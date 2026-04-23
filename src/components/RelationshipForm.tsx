import { useEffect, useMemo, useState } from "react";
import type { ClassNode } from "../types/ClassNode";
import { getPossibleRelationships, getRelationshipId } from "../service/RelationshipService.ts";
import type { Option } from "../types/Select.ts";
import Select from "./Select.tsx";
import type { Relationship, RelationshipOverview } from "../types/RelationshipOverview.ts";
import InputField from "./InputField.tsx";
import Button from "./Button.tsx";
import { useForm } from "react-hook-form";

type RelationshipFormProps = {
    subject: ClassNode;
    object: ClassNode | undefined;
    domain: string
    relationshipId: string | null,
    onRelationshipSelect: (subject: RelationshipOverview) => void;
    subjectId: string | null;
    objectId: string | null;
};

export default function RelationshipForm({ subject, object, domain, onRelationshipSelect, relationshipId, subjectId, objectId }: RelationshipFormProps) {

    const [relationships, setRelationships] = useState<RelationshipOverview[]>([]);
    const [relationshipOptions, setRelationshipOptions] = useState<Option[]>([]);

    const [currentRelationship, setCurrentRelationship] = useState<Relationship | null>(null);
    const currentRelationshipOptions: Option[] = useMemo(() => {
        return currentRelationship?.instances?.map((inst: never) => ({ value: inst["id"], label: `${inst["source"]["name"]} -> ${inst["target"]["name"]}`})) ?? []
    }, [currentRelationship])

    const selectedInstance = undefined;

    const {
        register,
        reset,
        handleSubmit,
        clearErrors,
        formState: { isSubmitting, errors }
    } = useForm({
        defaultValues: selectedInstance ?? {},
        mode: "onBlur",
    });

    useEffect(() => {
        getPossibleRelationships(domain, subject.name, object?.name).then((data) => {
            setRelationshipOptions(
                data.relationships.map((r: RelationshipOverview) => ({ label: r.name, value: r.name }))
            );
            setRelationships(data.relationships as RelationshipOverview[]);
        })
    }, [subject, object]);

    function onRelationshipOptionSelected(rName: string) {
        onRelationshipSelect(relationships.find(r => r.name === rName)!);
    }

    useEffect(() => {
        console.log(relationshipId);
        if (relationshipId) {
            getRelationshipId(domain, relationshipId).then((data: Relationship) => {
                setCurrentRelationship(data);
                console.log(data)
            })
        }

    }, [relationshipId]);

    function onSubmit() {

    }

    function onReset() {
        console.log("onReset");
    }

    return (
        <div>
            {
                relationshipOptions.length > 0 &&
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            options={relationshipOptions}
                            placeholder="Select a relationship"
                            onChange={onRelationshipOptionSelected}
                            value={relationshipId ?? undefined}
                        />

                        <Select
                            options={currentRelationshipOptions}
                            placeholder="Select a relationship instance"
                            onChange={onRelationshipOptionSelected}
                            value={undefined}
                        />
                    </div>


                    <div className="text-lg font-bold">
                        Properties
                    </div>


                    {Object.keys(currentRelationship?.properties ?? {}).length ? (
                        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
                            {Object.entries(currentRelationship?.properties ?? {}).map(([key, config]) => (
                                <div key={key}>
                                    {config.type === "string" || config.type === "number" || config.type === "date" ? (
                                        <InputField
                                            label={`${key}${config.required ? ' *' : ''}`}
                                            type={config.type === "date" ? "date" : config.type}
                                            registration={register(key, { required: config.required ? `${key} is required` : false })}
                                            error={errors[key] as never}
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
                                                error={errors[key] as never}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            <div className="flex justify-end gap-2 col-span-2">
                                <Button type="reset" onClick={onReset} disabled={isSubmitting} variant="secondary">
                                    Reset
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Loading..." : selectedInstance ? "Edit" : "Save"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div>Select an instance to edit or select a class for edit</div>
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
