import { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="flex flex-col gap-0.5">
            <label className={`label ${sizeLabelClasses[size]}`}>{label}</label>

            <div className="relative">
                <input
                    type={inputType}
                    placeholder={placeholder}
                    {...registration}
                    className={`input ${sizeInputClasses[size]} ${error ? "input-error" : ""} ${isPassword ? "pr-10" : ""} w-full`}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3! py-0! bg-gray-500! m-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>

            {error && <span className="error-text text-xs">{error.message}</span>}
        </div>
    );
}
