import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { sizeInputClasses, sizeLabelClasses } from "../utils/sizes.ts";

type FileInputProps = {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    accept?: string;
    multiple?: boolean;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
};

export default function FileInput({
    label,
    registration,
    error,
    accept,
    multiple = false,
    placeholder = "Choose file(s)",
    size = "md"
}: FileInputProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <label className={`label ${sizeLabelClasses[size]}`}>{label}</label>

            <input
                type="file"
                accept={accept}
                multiple={multiple}
                {...registration}
                placeholder={placeholder}
                className={`input ${sizeInputClasses[size]} ${error ? "input-error" : ""} cursor-pointer`}
            />

            {error && <span className="error-text">{error.message}</span>}
        </div>
    );
}
