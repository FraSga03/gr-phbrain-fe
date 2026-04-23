import { useMemo, useState } from "react";
import type { TableProps, Column } from "../types/Table.ts";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import type { PaginatedResult } from "../types/Paginate.ts";

export default function Table<T>({
    data,
    columns,
    pageSize = 10,
    pagination = false,
    paginatedResult,
    onPageChange,
}: TableProps<T>) {
    const [page, setPage] = useState(1);

    const isServerMode = paginatedResult !== undefined;

    const totalPages = isServerMode
        ? paginatedResult!.totalPages
        : Math.ceil((data?.length ?? 0) / pageSize);

    const currentPage = isServerMode ? paginatedResult!.page : page;

    const rows = useMemo<T[]>(() => {
        if (isServerMode) return paginatedResult!.data;
        if (!pagination) return data ?? [];
        const start = (page - 1) * pageSize;
        return (data ?? []).slice(start, start + pageSize);
    }, [isServerMode, paginatedResult, data, page, pageSize, pagination]);

    const canPrev = isServerMode ? paginatedResult!.hasPrevPage : currentPage > 1;
    const canNext = isServerMode ? paginatedResult!.hasNextPage : currentPage < totalPages;

    function goTo(p: number) {
        if (isServerMode) {
            onPageChange?.(p);
        } else {
            setPage(p);
        }
    }

    function renderCellContent<T>(
        col: Column<T>,
        row: T,
        index: number,
        currentPage: number,
        pageSize: number,
        isServerMode: boolean,
        paginatedResult?: PaginatedResult<T>
    ): React.ReactNode {
        if (col.key === "index") {
            return (currentPage - 1) * (isServerMode ? paginatedResult!.limit : pageSize) + index + 1;
        }
        if (col.render) {
            return col.render(row[col.key as keyof T], row);
        }
        return String(row[col.key as keyof T]);
    }

    const showPagination = isServerMode || pagination;

    return (
        <div className="w-full min-h-[350px] flex flex-col justify-between">
            <div className="flex-1 overflow-auto border rounded-md bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b soft-border">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className="p-3 text-sm font-semibold"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row: T, i: number) => (
                        <tr
                            key={i}
                            className={`${i + 1 !== rows.length ? 'border-b soft-border' : ''} hover:bg-gray-50 transition`}
                        >
                            {columns.map((col) => (
                                <td key={String(col.key)} className="p-3 text-sm">
                                    {renderCellContent(col, row, i, currentPage, pageSize, isServerMode, paginatedResult)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showPagination && (
                <div className="flex items-center justify-between mt-3 text-sm">
                    <div>
                        Page {currentPage} / {totalPages}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={!canPrev}
                            onClick={() => goTo(1)}
                        >
                            <FaAngleDoubleLeft />
                        </button>

                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={!canPrev}
                            onClick={() => goTo(currentPage - 1)}
                        >
                            <FaAngleLeft />
                        </button>

                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            disabled={!canNext}
                            onClick={() => goTo(currentPage + 1)}
                        >
                            <FaAngleRight />
                        </button>

                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            disabled={!canNext}
                            onClick={() => goTo(totalPages)}
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
