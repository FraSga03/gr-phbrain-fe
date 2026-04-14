import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
    label: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    type?: string;
    placeholder?: string;
};

export default function Input({
  label,
  registration,
  error,
  type = "text",
  placeholder,
}: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="label">{label}</label>

            <input
                type={type}
                placeholder={placeholder}
                {...registration}
                className={`input ${error ? "input-error" : ""}`}
            />

            {error && <span className="error-text">{error.message}</span>}
        </div>
    );
}