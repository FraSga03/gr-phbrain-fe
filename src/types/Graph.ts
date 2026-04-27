export type Graph = {
    domain: string;
    nodes: {
        id: string;
        class: string;
        label: string;
    }[];
    edges: {
        id: string;
        source: string;
        target: string;
        label: string;
    }[];
};