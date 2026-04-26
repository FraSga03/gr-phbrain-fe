import type { Property } from "./ClassNode.ts";

export type SchemaEdit = ({
    kind: "property",
    toBeDeleted?: boolean,
    class: string;
    name: string;
    originalName?: string;
} & Property) | ({
    kind: "relationshipProperty",
    toBeDeleted?: boolean,
    relationship: string;
    name: string;
    originalName?: string;
} & Property) | {
    kind: "class",
    toBeDeleted: boolean,
    originalName: string,
    name: string,
} | {
    kind: "value",
    toBeDeleted: boolean,
    originalValue: string,
    newValue: string,
    property: string,
    class?: string,
    relationship?: string,
} | {
    kind: "relationship",
    toBeDeleted: boolean,
    originalName: string,
    name: string,
    subjectClass?: string,
    objectClass?: string,
} | {
    kind: "newRelationship",
    name: string,
    subjectClass: string,
    objectClass: string,
} | {
    kind: "newClass",
    name: string,
    parent?: string,
}
