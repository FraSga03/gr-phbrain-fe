export type DomainClass = {
    name: string;
    children?: DomainClass[]
}

export type HierarchyNode =  {
    name: string;
    children: HierarchyNode[];
}

export type DomainHierarchy = {
    domain: string;
    totalTopClasses: number;
    totalSubclasses: number;
    hierarchy: HierarchyNode[];
}