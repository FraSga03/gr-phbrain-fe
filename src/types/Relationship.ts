import type { ClassNodeInstance, Properties } from "./ClassNode.ts";

export type RelationshipNode = {
    class: string;
    path?: string[];
};


export type Relationship = {
    name: string;
    subject: RelationshipNode;
    object: RelationshipNode;
    domain?: string;
    type?: string;
    instances?: RelationshipInstance[];
    properties?: Properties;
};

export type PossibleRelationship = {
    domain: string;
    object?: string;
    subject: string;
    relationships: Relationship[]
    totalFound: number;
}

export type RelationshipInstance = {
    id: string;
    name: string;
    subject: ClassNodeInstance;
    object: ClassNodeInstance;
    properties: Record<string, unknown>;
};

export type DomainRelationships = {
    domain: string;
    totalFound: number;
    relationships: Relationship[];
};
