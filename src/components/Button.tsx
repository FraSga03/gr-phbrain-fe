import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
    size?: "sm" | "md";
    disabled?: boolean;
    onClick?: () => void;
    name?: string;
};

export default function Button({
   children,
   type = "button",
   variant = "primary",
   size = "md",
   disabled = false,
   onClick,
   name,
}: ButtonProps) {
    const sizeClasses = size === "sm" ? "!h-8 !px-3 !text-sm" : "";

    return (
        <button
            type={type}
            name={name}
            onClick={onClick}
            disabled={disabled}
            className={`${variant === "primary" ? "button" : "button-secondary"} ${sizeClasses} ${
                disabled ? "button-disabled" : ""
            } flex items-center justify-center`}
        >
            {children}
        </button>
    );
}