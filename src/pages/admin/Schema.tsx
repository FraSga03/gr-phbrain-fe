import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.tsx";
import { useDomain } from "../../contexts/DomainContext.tsx";
import { useSchema } from "../../contexts/SchemaContext.tsx";
import { getDomainClasses, getDomainHierarchy, getSubclasses } from "../../services/DomainService.ts";
import ListClassSelector from "../../components/ListClassSelector.tsx";
import ListRelationshipSelector from "../../components/ListRelationshipSelector.tsx";
import type { DomainHierarchy, HierarchyNode } from "../../types/DomainClass.ts";
import type { ClassNode, Properties } from "../../types/ClassNode.ts";
import PropertiesTable from "../../components/PropertiesTableProps.tsx";
import type { DomainRelationships, Relationship } from "../../types/Relationship.ts";
import { getAllRelationships, getRelationshipById } from "../../services/RelationshipService.ts";
import type { SchemaEdit } from "../../types/Schema.ts";
import SchemaHandler from "../../components/SchemaHandler.tsx";
import { FaXmark } from "react-icons/fa6";

export default function Schema() {
    const { selectedDomain } = useDomain();
    const {
        selectedClass,
        setSelectedClass,
        selectedProperty,
        setSelectedProperty,
        selectedRelationshipId,
        setSelectedRelationshipId,
        clearRelationshipSelection,
        uploadedFile,
        setUploadedFile
    } = useSchema();
    const [hierarchy, setHierarchy] = useState<DomainHierarchy | undefined>(undefined);
    const [domainRelationships, setDomainRelationships] = useState<DomainRelationships | undefined>(undefined);
    const [selectedNode, setSelectedNode] = useState<ClassNode | undefined>(undefined);
    const [selectedRelationship, setSelectedRelationship] = useState<Relationship | undefined>(undefined);
    const [schemaEdits, setSchemaEdits] = useState<SchemaEdit[]>([]);
    const [domainClasses, setDomainClasses] = useState<string[]>([]);

    function pushPropertyEdit(edit: SchemaEdit) {
        setSchemaEdits((prev) => [...prev, edit]);
    }

    // Walk the hierarchy to find the ancestor chain of a class. Properties are
    // inherited from ancestors, so edits made on an ancestor must be reflected
    // when viewing a subclass.
    function getAncestorChain(targetName: string, nodes: HierarchyNode[], path: string[] = []): string[] | null {
        for (const node of nodes) {
            const next = [...path, node.name];
            if (node.name === targetName) return next;
            const found = getAncestorChain(targetName, node.children, next);
            if (found) return found;
        }
        return null;
    }

    function applyPropertyEdits(
        base: Properties | undefined,
        targetNames: string[],
        edits: SchemaEdit[],
        kind: "property" | "relationshipProperty",
    ) {
        const allowed = new Set(targetNames);
        const next: Properties = { ...(base ?? {}) };

        for (const edit of edits) {
            if (edit.kind === kind) {
                const owner = edit.kind === "property" ? edit.class : edit.relationship;
                if (!allowed.has(owner)) continue;

                const key = edit.originalName ?? edit.name;

                if (edit.toBeDeleted) {
                    delete next[key];
                    continue;
                }

                if (edit.originalName && edit.originalName !== edit.name) {
                    delete next[edit.originalName];
                }

                next[edit.name] = {
                    required: edit.required,
                    unique: edit.unique,
                    type: edit.type,
                };
                continue;
            }

            if (edit.kind === "value") {
                const owner = kind === "property" ? edit.class : edit.relationship;
                if (!owner || !allowed.has(owner)) continue;

                const prop = next[edit.property];
                if (!prop || !Array.isArray(prop.type)) continue;

                let values = [...prop.type];
                if (edit.toBeDeleted) {
                    values = values.filter((v) => v !== edit.originalValue);
                } else if (edit.originalValue) {
                    const idx = values.indexOf(edit.originalValue);
                    if (idx >= 0) values[idx] = edit.newValue;
                    else values.push(edit.newValue);
                } else {
                    if (!values.includes(edit.newValue)) values.push(edit.newValue);
                }
                next[edit.property] = { ...prop, type: values };
            }
        }

        return next;
    }

    // Apply class-level edits (rename + delete) to the hierarchy so deletes
    // disappear from the tree and renames show the new name.
    const displayedHierarchy = useMemo<DomainHierarchy | undefined>(() => {
        if (!hierarchy) return undefined;

        const deleted = new Set<string>();
        const renames = new Map<string, string>();
        for (const edit of schemaEdits) {
            if (edit.kind !== "class") continue;
            if (edit.toBeDeleted) {
                deleted.add(edit.originalName);
            } else if (edit.originalName !== edit.name) {
                renames.set(edit.originalName, edit.name);
            }
        }

        function transform(nodes: HierarchyNode[]): HierarchyNode[] {
            const out: HierarchyNode[] = [];
            for (const node of nodes) {
                if (deleted.has(node.name)) continue;
                out.push({
                    name: renames.get(node.name) ?? node.name,
                    children: transform(node.children),
                });
            }
            return out;
        }

        const next = transform(hierarchy.hierarchy);

        // Append newly-added classes. If a parent is specified, insert as a child;
        // otherwise add at the root.
        for (const edit of schemaEdits) {
            if (edit.kind !== "newClass") continue;
            const newNode: HierarchyNode = { name: edit.name, children: [] };
            if (!edit.parent) {
                next.push(newNode);
                continue;
            }
            const insertInto = (nodes: HierarchyNode[]): boolean => {
                for (const n of nodes) {
                    if (n.name === edit.parent) {
                        n.children = [...n.children, newNode];
                        return true;
                    }
                    if (insertInto(n.children)) return true;
                }
                return false;
            };
            if (!insertInto(next)) next.push(newNode);
        }

        return {
            ...hierarchy,
            hierarchy: next,
            totalTopClasses: next.length,
            totalSubclasses: next.reduce(function count(acc: number, n): number {
                return acc + n.children.length + n.children.reduce(count, 0);
            }, 0),
        };
    }, [hierarchy, schemaEdits]);

    // Apply relationship-level edits (rename + delete) so deleted relationships
    // disappear from the list and renames show the new name.
    const displayedRelationships = useMemo<DomainRelationships | undefined>(() => {
        if (!domainRelationships) return undefined;

        const deleted = new Set<string>();
        const updates = new Map<string, { name: string; subjectClass?: string; objectClass?: string }>();
        for (const edit of schemaEdits) {
            if (edit.kind !== "relationship") continue;
            if (edit.toBeDeleted) {
                deleted.add(edit.originalName);
                updates.delete(edit.originalName);
                continue;
            }
            updates.set(edit.originalName, {
                name: edit.name,
                subjectClass: edit.subjectClass,
                objectClass: edit.objectClass,
            });
        }

        const next = domainRelationships.relationships
            .filter((r) => !deleted.has(r.name))
            .map((r) => {
                const u = updates.get(r.name);
                if (!u) return r;
                return {
                    ...r,
                    name: u.name,
                    subject: u.subjectClass ? { ...r.subject, class: u.subjectClass } : r.subject,
                    object: u.objectClass ? { ...r.object, class: u.objectClass } : r.object,
                };
            });

        for (const edit of schemaEdits) {
            if (edit.kind !== "newRelationship") continue;
            next.push({
                name: edit.name,
                subject: { class: edit.subjectClass },
                object: { class: edit.objectClass },
            } as Relationship);
        }

        return {
            ...domainRelationships,
            relationships: next,
            totalFound: next.length,
        };
    }, [domainRelationships, schemaEdits]);

    const classDisplayedProperties = useMemo(() => {
        if (!selectedNode) return {};
        if (!selectedClass) return applyPropertyEdits(selectedNode.properties, [selectedNode.name], schemaEdits, "property");
        const chain =
            (displayedHierarchy && getAncestorChain(selectedClass, displayedHierarchy.hierarchy)) ??
            (hierarchy && getAncestorChain(selectedNode.name, hierarchy.hierarchy)) ??
            [selectedClass];
        return applyPropertyEdits(selectedNode.properties, chain, schemaEdits, "property");
    }, [selectedNode, selectedClass, displayedHierarchy, hierarchy, schemaEdits]);

    const relationshipDisplayedProperties = useMemo(() => {
        if (!selectedRelationship) return {};
        return applyPropertyEdits(selectedRelationship.properties, [selectedRelationship.name], schemaEdits, "relationshipProperty");
    }, [selectedRelationship, schemaEdits]);

    const domainKey = uploadedFile?.id ?? selectedDomain;

    useEffect(() => {
        if (!domainKey) return;

        getDomainHierarchy(domainKey).then(setHierarchy);
        getAllRelationships(domainKey).then(setDomainRelationships);
        getDomainClasses(domainKey).then(setDomainClasses);
    }, [domainKey]);

    useEffect(() => {
        if (!domainKey || !selectedClass) return;

        // Resolve a class name (possibly displayed/renamed) back to its backend
        // name and find the closest non-new ancestor whose properties we can
        // fetch. New classes recurse up through new ancestors until they find
        // a real one.
        function resolveBackendName(name: string): string {
            const rename = schemaEdits.find(
                (e) => e.kind === "class" && !e.toBeDeleted && e.name === name && e.originalName !== e.name,
            );
            return rename && rename.kind === "class" ? rename.originalName : name;
        }

        function findInheritedParent(name: string): string | null {
            const newEdit = schemaEdits.find((e) => e.kind === "newClass" && e.name === name);
            if (!newEdit || newEdit.kind !== "newClass") return resolveBackendName(name);
            if (!newEdit.parent) return null;
            return findInheritedParent(newEdit.parent);
        }

        const newClass = schemaEdits.find((e) => e.kind === "newClass" && e.name === selectedClass);
        if (newClass && newClass.kind === "newClass") {
            const inheritFrom = newClass.parent ? findInheritedParent(newClass.parent) : null;
            if (!inheritFrom) {
                setSelectedNode({ name: selectedClass, children: [], instances: [], properties: {} });
                return;
            }
            getSubclasses(domainKey, inheritFrom).then((parent) => {
                setSelectedNode({
                    name: selectedClass,
                    children: [],
                    instances: [],
                    properties: parent.properties ?? {},
                });
            });
            return;
        }

        getSubclasses(domainKey, resolveBackendName(selectedClass)).then(setSelectedNode);
    }, [selectedClass, domainKey]);

    // If the selected class is no longer present in the (edit-aware) hierarchy,
    // clear the selection so the properties panel hides too.
    useEffect(() => {
        if (!selectedClass || !displayedHierarchy) return;
        const exists = (nodes: HierarchyNode[]): boolean =>
            nodes.some((n) => n.name === selectedClass || exists(n.children));
        if (!exists(displayedHierarchy.hierarchy)) {
            setSelectedClass(null);
            setSelectedNode(undefined);
            setSelectedProperty(null);
        }
    }, [displayedHierarchy, selectedClass]);

    // If the selected relationship is no longer present in the (edit-aware)
    // list, clear the selection so the properties panel hides too.
    useEffect(() => {
        if (!selectedRelationshipId || !displayedRelationships) return;
        const exists = displayedRelationships.relationships.some((r) => r.name === selectedRelationshipId);
        if (!exists) {
            clearRelationshipSelection();
            setSelectedRelationship(undefined);
        }
    }, [displayedRelationships, selectedRelationshipId]);

    useEffect(() => {
        if (!domainKey || !selectedRelationshipId) return;

        // A relationship added in the current session has no backend record yet —
        // synthesize an empty one. A renamed relationship must be fetched by its
        // ORIGINAL name since the rename has not been persisted.
        const newEdit = schemaEdits.find((e) => e.kind === "newRelationship" && e.name === selectedRelationshipId);
        if (newEdit && newEdit.kind === "newRelationship") {
            setSelectedRelationship({
                name: newEdit.name,
                subject: { class: newEdit.subjectClass },
                object: { class: newEdit.objectClass },
                properties: {},
            } as Relationship);
            return;
        }

        const renameEdit = schemaEdits.find(
            (e) => e.kind === "relationship" && !e.toBeDeleted && e.name === selectedRelationshipId && e.originalName !== e.name,
        );
        const fetchName = renameEdit && renameEdit.kind === "relationship" ? renameEdit.originalName : selectedRelationshipId;

        getRelationshipById(domainKey, fetchName).then(setSelectedRelationship);
    }, [selectedRelationshipId, domainKey]);

    useEffect(() => {
        if (schemaEdits.length === 0) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);

        return () => {
            window.removeEventListener("beforeunload", handler);
        };
    }, [schemaEdits.length]);

    return (
        <div className="grid grid-cols-2 grid-rows-[auto_minmax(0,1fr)] gap-2 h-full min-h-0">
            <div className="col-span-2">
                <Card title="Domain" subtitle={`${schemaEdits.length ? schemaEdits.length + " edit" + (schemaEdits.length > 1 ? 's' : '') :''}`}>
                    <div className="flex flex-col gap-1">
                        <div>
                            Currently using the{" "}
                            {uploadedFile ? (
                                <>
                                    uploaded file{" "}
                                    <span className="inline-flex items-center gap-1 px-2 bg-gray-200 rounded">
                                        {uploadedFile.filename}
                                        <button
                                            type="button"
                                            onClick={() => setUploadedFile(null)}
                                            className="inline-flex items-center justify-center h-1! w-6! px-0! bg-white! rounded-full cursor-pointer"
                                        >
                                            <FaXmark color="red" size={15} />
                                        </button>
                                    </span>
                                </>
                            ) : (
                                <><b>{selectedDomain}</b> domain</>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <SchemaHandler uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} schemaEdits={schemaEdits} />
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Classes" scrollable className="min-h-0">
                <div className="flex flex-col gap-1">
                    {
                        displayedHierarchy ?
                            <ListClassSelector
                                hierarchy={displayedHierarchy}
                                domainClasses={domainClasses}
                                onSelect={setSelectedClass}
                                selectedClass={selectedClass ?? undefined}
                                onAdd={(form) => setSchemaEdits((prev) => [...prev, {
                                    kind: "newClass",
                                    name: form.name,
                                    parent: form.parent || undefined,
                                }])}
                                onEdit={(originalName, newName) => setSchemaEdits((prev) => {
                                    const existingIdx = prev.findIndex(
                                        (e) => e.kind === "class" && !e.toBeDeleted && e.name === originalName,
                                    );
                                    if (existingIdx >= 0) {
                                        const existing = prev[existingIdx];
                                        const next = [...prev];
                                        next[existingIdx] = { ...existing, name: newName } as SchemaEdit;
                                        return next;
                                    }
                                    const newClassIdx = prev.findIndex(
                                        (e) => e.kind === "newClass" && e.name === originalName,
                                    );
                                    if (newClassIdx >= 0) {
                                        const existing = prev[newClassIdx];
                                        const next = [...prev];
                                        next[newClassIdx] = { ...existing, name: newName } as SchemaEdit;
                                        return next;
                                    }
                                    return [...prev, {
                                        kind: "class",
                                        toBeDeleted: false,
                                        originalName,
                                        name: newName,
                                    }];
                                })}
                                onDelete={(node) => {
                                    setSchemaEdits((prev) => [...prev, {
                                        kind: "class",
                                        toBeDeleted: true,
                                        originalName: node.name,
                                        name: node.name,
                                    }]);
                                    if (selectedClass === node.name) {
                                        setSelectedClass(null);
                                        setSelectedNode(undefined);
                                        setSelectedProperty(null);
                                    }
                                }}
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
                                    properties={Object.keys(classDisplayedProperties).map((key: string) => ({
                                        propertyName: key,
                                        ...(classDisplayedProperties[key]!)
                                    }))}
                                    selectedProperty={selectedProperty}
                                    onSelectProperty={setSelectedProperty}
                                    onAddProperty={(p) => pushPropertyEdit({
                                        kind: "property",
                                        class: selectedNode.name,
                                        name: p.propertyName,
                                        required: p.required,
                                        unique: p.unique,
                                        type: p.type,
                                    } as SchemaEdit)}
                                    onEditProperty={(originalName, p) => pushPropertyEdit({
                                        kind: "property",
                                        class: selectedNode.name,
                                        name: p.propertyName,
                                        originalName,
                                        required: p.required,
                                        unique: p.unique,
                                        type: p.type,
                                    } as SchemaEdit)}
                                    onDeleteProperty={(originalName, p) => pushPropertyEdit({
                                        kind: "property",
                                        class: selectedNode.name,
                                        name: p.propertyName,
                                        originalName,
                                        toBeDeleted: true,
                                        required: p.required,
                                        unique: p.unique,
                                        type: p.type,
                                    } as SchemaEdit)}
                                    onAddValue={(p, newValue) => pushPropertyEdit({
                                        kind: "value",
                                        toBeDeleted: false,
                                        originalValue: "",
                                        newValue,
                                        property: p.propertyName,
                                        class: selectedNode.name,
                                    } as SchemaEdit)}
                                    onEditValue={(p, originalValue, newValue) => pushPropertyEdit({
                                        kind: "value",
                                        toBeDeleted: false,
                                        originalValue,
                                        newValue,
                                        property: p.propertyName,
                                        class: selectedNode.name,
                                    } as SchemaEdit)}
                                    onDeleteValue={(p, value) => pushPropertyEdit({
                                        kind: "value",
                                        toBeDeleted: true,
                                        originalValue: value,
                                        newValue: value,
                                        property: p.propertyName,
                                        class: selectedNode.name,
                                    } as SchemaEdit)}
                                />
                            </>
                        )
                    }
                </div>

            </Card>

            <Card title="Relationships" scrollable className="min-h-0">
                <div className="flex flex-col gap-1">
                    {
                        displayedRelationships ?
                            <ListRelationshipSelector
                                domainRelationships={displayedRelationships}
                                domainClasses={domainClasses}
                                onSelect={setSelectedRelationshipId}
                                onAdd={(rel) => setSchemaEdits((prev) => [...prev, {
                                    kind: "newRelationship",
                                    name: rel.name,
                                    subjectClass: rel.subjectId,
                                    objectClass: rel.objectId,
                                }])}
                                selectedRelationshipId={selectedRelationshipId ?? undefined}
                                onEdit={(originalName, edited) => {
                                    setSchemaEdits((prev) => {
                                        const existingRelIdx = prev.findIndex(
                                            (e) => e.kind === "relationship" && !e.toBeDeleted && e.name === originalName,
                                        );
                                        if (existingRelIdx >= 0) {
                                            const existing = prev[existingRelIdx];
                                            const next = [...prev];
                                            next[existingRelIdx] = {
                                                ...existing,
                                                name: edited.name,
                                                subjectClass: edited.subjectId,
                                                objectClass: edited.objectId,
                                            } as SchemaEdit;
                                            return next;
                                        }
                                        const newRelIdx = prev.findIndex(
                                            (e) => e.kind === "newRelationship" && e.name === originalName,
                                        );
                                        if (newRelIdx >= 0) {
                                            const existing = prev[newRelIdx];
                                            const next = [...prev];
                                            next[newRelIdx] = {
                                                ...existing,
                                                name: edited.name,
                                                subjectClass: edited.subjectId,
                                                objectClass: edited.objectId,
                                            } as SchemaEdit;
                                            return next;
                                        }
                                        return [...prev, {
                                            kind: "relationship",
                                            toBeDeleted: false,
                                            originalName,
                                            name: edited.name,
                                            subjectClass: edited.subjectId,
                                            objectClass: edited.objectId,
                                        }];
                                    });
                                    clearRelationshipSelection();
                                    setSelectedRelationship(undefined);
                                }}
                                onDelete={(rel) => {
                                    setSchemaEdits((prev) => [...prev, {
                                        kind: "relationship",
                                        toBeDeleted: true,
                                        originalName: rel.name,
                                        name: rel.name,
                                    }]);
                                    clearRelationshipSelection();
                                    setSelectedRelationship(undefined);
                                }}
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
                                properties={Object.keys(relationshipDisplayedProperties).map((key: string) => ({
                                    propertyName: key,
                                    ...(relationshipDisplayedProperties[key]!)
                                }))}
                                selectedProperty={selectedProperty}
                                onSelectProperty={setSelectedProperty}
                                onAddProperty={(p) => pushPropertyEdit({
                                    kind: "relationshipProperty",
                                    relationship: selectedRelationship.name,
                                    name: p.propertyName,
                                    required: p.required,
                                    unique: p.unique,
                                    type: p.type,
                                } as SchemaEdit)}
                                onEditProperty={(originalName, p) => pushPropertyEdit({
                                    kind: "relationshipProperty",
                                    relationship: selectedRelationship.name,
                                    name: p.propertyName,
                                    originalName,
                                    required: p.required,
                                    unique: p.unique,
                                    type: p.type,
                                } as SchemaEdit)}
                                onDeleteProperty={(originalName, p) => pushPropertyEdit({
                                    kind: "relationshipProperty",
                                    relationship: selectedRelationship.name,
                                    name: p.propertyName,
                                    originalName,
                                    toBeDeleted: true,
                                    required: p.required,
                                    unique: p.unique,
                                    type: p.type,
                                } as SchemaEdit)}
                                onAddValue={(p, newValue) => pushPropertyEdit({
                                    kind: "value",
                                    toBeDeleted: false,
                                    originalValue: "",
                                    newValue,
                                    property: p.propertyName,
                                    relationship: selectedRelationship.name,
                                } as SchemaEdit)}
                                onEditValue={(p, originalValue, newValue) => pushPropertyEdit({
                                    kind: "value",
                                    toBeDeleted: false,
                                    originalValue,
                                    newValue,
                                    property: p.propertyName,
                                    relationship: selectedRelationship.name,
                                } as SchemaEdit)}
                                onDeleteValue={(p, value) => pushPropertyEdit({
                                    kind: "value",
                                    toBeDeleted: true,
                                    originalValue: value,
                                    newValue: value,
                                    property: p.propertyName,
                                    relationship: selectedRelationship.name,
                                } as SchemaEdit)}
                            />
                        </>
                    )
                }
            </Card>
        </div>
    );
}
