import { useMemo, useState } from "react";
import type { TableProps } from "../types/Table.ts";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa";

export default function Table<T>({
    data,
    columns,
    pageSize = 10,
    pagination = false
}: TableProps<T>) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = useMemo(() => {
        if (!pagination) return data;
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, page, pageSize, pagination]);

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
                    {paginatedData.map((row, i) => (
                        <tr
                            key={i}
                            className={`${i+1 !== paginatedData.length ? 'border-b soft-border' : ''} hover:bg-gray-50 transition`}
                        >
                            {columns.map((col) => (
                                <td key={String(col.key)} className="p-3 text-sm">
                                    {col.render
                                        ? col.render(row[col.key], row)
                                        : String(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex items-center justify-between mt-3 text-sm">
                    <div>
                        Page {page} / {totalPages}
                    </div>

                    <div className="flex gap-2">
                        {/* FIRST */}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={page === 1}
                            onClick={() => setPage(1)}
                        >
                            <FaAngleDoubleLeft />
                        </button>

                        {/* PREV */}
                        <button
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <FaAngleLeft />
                        </button>

                        {/* NEXT */}
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <FaAngleRight />
                        </button>

                        {/* LAST */}
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            disabled={page === totalPages}
                            onClick={() => setPage(totalPages)}
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}