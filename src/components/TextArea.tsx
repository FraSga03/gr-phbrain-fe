import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type TextAreaProps = {
    label?: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    type?: string;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
};

const sizeLabelClasses = {
    sm: "text-md!",
    md: "text-lg!",
    lg: "text-xl!",
};

export default function TextArea({
    label,
    registration,
    error,
    placeholder,
    size = "md"
}: TextAreaProps) {
    return (
        <div className="flex flex-col gap-1">
            {
                label &&
                <label className={`label ${sizeLabelClasses[size]}`}>{label}</label>
            }

            <textarea
                placeholder={placeholder}
                {...registration}
                className={`input ${error ? "input-error" : ""} min-h-[5rem]`}
            />

            {error && <span className="error-text">{error.message}</span>}
        </div>
    );
}