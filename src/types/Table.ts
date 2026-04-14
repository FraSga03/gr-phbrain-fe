export type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type TableProps<T> = {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    pagination?: boolean;
};