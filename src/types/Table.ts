import type { PaginatedResult } from "./Paginate.ts";

export type Column<T> = {
    key: keyof T | "index";
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type TableProps<T> = {
    columns: Column<T>[];
    // Client-side pagination
    data?: T[];
    pageSize?: number;
    pagination?: boolean;
    // Server-side pagination
    paginatedResult?: PaginatedResult<T>;
    onPageChange?: (page: number) => void;
};
