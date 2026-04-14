import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type TextAreaProps = {
    label?: string;
    registration: UseFormRegisterReturn;
    error?: FieldError;
    type?: string;
    placeholder?: string;
};

export default function TextArea({
  label,
  registration,
  error,
  placeholder,
}: TextAreaProps) {
    return (
        <div className="flex flex-col gap-1">
            {
                label &&
                <label className="label">{label}</label>
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