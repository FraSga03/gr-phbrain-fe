import type { SelectProps } from "../types/Select.ts";

export default function Select({
   options,
   placeholder = "Select an option",
   error,
   registration,
}: SelectProps) {
    return (
        <div className="flex flex-col">
            <select
                {...registration}
                className={`h-12 bg-white shadow-sm rounded-[4px] px-3 border border-gray-200 outline-none transition
                    ${error ? "border-red-500 ring-2 ring-red-100" : "focus:border-blue-800 focus:ring-2 focus:ring-blue-100"}`}
            >
                <option value="" disabled hidden>{placeholder}</option>

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                    {opt.label}
                    </option>
                ))}
            </select>

            {error && (
                <span className="text-sm mt-1 text-red-500">
                    {error.message}
                    </span>
            )}
        </div>
    );
}