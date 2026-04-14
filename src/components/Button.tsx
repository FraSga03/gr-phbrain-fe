import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
    disabled?: boolean;
    onClick?: () => void;
};

export default function Button({
   children,
   type = "button",
   variant = "primary",
   disabled = false,
   onClick,
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${variant === "primary" ? "button" : "button-secondary"} ${
                disabled ? "button-disabled" : ""
            }`}
        >
            {children}
        </button>
    );
}