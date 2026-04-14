import type { PillProps } from "../types/Pill.ts";

export default function Pill({ title, onClick }: PillProps) {
    return (
        <div
            onClick={onClick}
            className="bg-gray-100 rounded-md shadow-md p-1 select-none cursor-pointer hover:bg-gray-200 transition"
        >
            {title}
        </div>
    );
}