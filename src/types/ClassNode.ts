export type ClassNode = {
    name: string,
    children: string[],
    instances: ClassNodeInstance[],
    properties?: Properties
}

export type Properties = { [key: string]: Property };

export type ClassNodeInstance = {
    __id: string;
    name: string;
    [key: string]: unknown
}

export type Property = {
    required: boolean,
    type: "string" | string[] | "number" | "date",
    unique: boolean,
}