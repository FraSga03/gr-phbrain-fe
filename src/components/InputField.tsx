import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { sizeInputClasses, sizeLabelClasses } from "../utils/sizes.ts";

type InputProps = {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    type?: string;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
};

export default function Input({
  label,
  registration,
  error,
  type = "text",
  placeholder,
  size = "md",
}: InputProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <label className={`label ${sizeLabelClasses[size]}`}>{label}</label>

            <input
                type={type}
                placeholder={placeholder}
                {...registration}
                className={`input ${sizeInputClasses[size]} ${error ? "input-error" : ""}`}
            />

            {error && <span className="error-text text-xs">{error.message}</span>}
        </div>
    );
}