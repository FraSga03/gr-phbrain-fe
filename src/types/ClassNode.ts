export type ClassNode = {
    name: string,
    children: string[],
    instances: Array<{ __id: string; name: string; [key: string]: unknown }>,
    properties?: {
        [key: string]: {
            required: boolean,
            type: "string" | string[] | "number" | "date"
        }
    }
}