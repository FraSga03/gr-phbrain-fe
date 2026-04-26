import { useEffect, useState } from "react";
import Card from "../../components/Card.tsx";
import { useDomain } from "../../context/DomainContext.tsx";
import { useSchema } from "../../context/SchemaContext.tsx";
import { getDomainHierarchy, getSubclasses } from "../../service/DomainService.ts";
import Button from "../../components/Button.tsx";
import ListClassSelector from "../../components/ListClassSelector.tsx";
import ListRelationshipSelector from "../../components/ListRelationshipSelector.tsx";
import type { DomainHierarchy } from "../../types/DomainClass.ts";
import type { ClassNode } from "../../types/ClassNode.ts";
import PropertiesTable from "../../components/PropertiesTable.tsx";
import type { DomainRelationships, Relationship } from "../../types/Relationship.ts";
import { getAllRelationships, getRelationshipById } from "../../service/RelationshipService.ts";

export default function Schema() {
    const { selectedDomain } = useDomain();
    const { selectedClass, setSelectedClass, selectedProperty, setSelectedProperty, selectedRelationshipId, setSelectedRelationshipId } = useSchema();
    const [hierarchy, setHierarchy] = useState<DomainHierarchy | undefined>(undefined);
    const [domainRelationships, setDomainRelationships] = useState<DomainRelationships | undefined>(undefined);
    const [selectedNode, setSelectedNode] = useState<ClassNode | undefined>(undefined);
    const [selectedRelationship, setSelectedRelationship] = useState<Relationship | undefined>(undefined);

    useEffect(() => {
        if (!selectedDomain) return;

        getDomainHierarchy(selectedDomain).then(setHierarchy);
        getAllRelationships(selectedDomain).then(setDomainRelationships);
    }, [selectedDomain]);

    useEffect(() => {
        if (!selectedDomain || !selectedClass) return;

        getSubclasses(selectedDomain, selectedClass).then(setSelectedNode);
    }, [selectedClass]);

    useEffect(() => {
        if (!selectedDomain || !selectedRelationshipId) return;

        getRelationshipById(selectedDomain, selectedRelationshipId).then(setSelectedRelationship);
    }, [selectedRelationshipId]);

    return (
        <div className="grid grid-cols-2 grid-rows-[auto_minmax(0,1fr)] gap-2 h-full min-h-0">
            <div className="col-span-2">
                <Card title="Domain">
                    <div className="flex flex-col gap-1">
                        <div>
                            Currently using the <b>{selectedDomain}</b> domain
                        </div>

                        <div>
                            Imported schemas:
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button size="sm">
                                Download
                            </Button>
                            <Button size="sm">
                                Upload
                            </Button>
                            <Button size="sm">
                                Extract graph
                            </Button>
                            <Button size="sm">
                                Export
                            </Button>
                        </div>
                    </div>

                </Card>
            </div>

            <Card title="Classes" scrollable className="min-h-0">
                <div className="flex flex-col gap-1">
                    {
                        hierarchy ?
                            <ListClassSelector
                                hierarchy={hierarchy}
                                onSelect={setSelectedClass}
                                selectedClass={selectedClass ?? undefined}
                            />
                            : <div>Select a domain first</div>
                    }

                    {
                        !!selectedNode &&
                        (
                            <>
                                <div className="text-accent text-lg">
                                    Properties
                                </div>

                                <PropertiesTable
                                    properties={Object.keys(selectedNode.properties ?? {}).map((key: string) => ({
                                        propertyName: key,
                                        ...((selectedNode.properties ?? {})[key]!)
                                    }))}
                                    selectedProperty={selectedProperty}
                                    onSelectProperty={setSelectedProperty}
                                />


                            </>
                        )
                    }
                </div>

            </Card>

            <Card title="Relationships" scrollable className="min-h-0">
                <div className="flex flex-col gap-1">
                    {
                        domainRelationships ?
                            <ListRelationshipSelector
                                domainRelationships={domainRelationships}
                                onSelect={setSelectedRelationshipId}
                                selectedRelationshipId={selectedRelationshipId ?? undefined}
                            />
                            : <div>Select a domain first</div>
                    }
                </div>

                {
                    !!selectedRelationship &&
                    (
                        <>
                            <div className="text-accent text-lg">
                                Properties
                            </div>

                            <PropertiesTable
                                properties={Object.keys(selectedRelationship.properties ?? {}).map((key: string) => ({
                                    propertyName: key,
                                    ...((selectedRelationship.properties ?? {})[key]!)
                                }))}
                                selectedProperty={selectedProperty}
                                onSelectProperty={setSelectedProperty}
                            />


                        </>
                    )
                }
            </Card>
        </div>
    );
}
