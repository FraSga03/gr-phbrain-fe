export type RelationshipOverview = {
    name: string
    subject: RelationshipNode,
    object: RelationshipNode,
    properties: { [key: string]: never }
}

export type RelationshipNode = {
    class: string
    path?: string[]
}

export type Relationship = {
    domain: string;
    instanceCount: number;
    name: string;
    object: RelationshipNode;
    subject: RelationshipNode;
    properties: { [key: string]: { required: boolean, type: string } };
    type: string;
    instances: never[]
}