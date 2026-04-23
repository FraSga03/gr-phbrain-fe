export interface PaginatedResult<T> {
    page: number;
    limit: number;

    totalItems: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPrevPage: boolean;

    nextPage: number | null;
    prevPage: number | null;

    data: T[];
}