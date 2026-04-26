import React from "react";

type CardProps = {
    children: React.ReactNode;
    className?: string;
    title?: React.ReactNode; // 👈 flexible (string or JSX)
    scrollable?: boolean;
};

export default function Card({ children, className = "", title, scrollable = false }: CardProps) {
    return (
        <div className={`card p-6 half-rounded flex flex-col gap-4 ${scrollable ? "min-h-0" : ""} ${className}`}>
            {title && (
                <div className="text-accent text-xl font-semibold leading-none shrink-0">
                    {title}
                </div>
            )}

            <div className={scrollable ? "flex-1 min-h-0 overflow-y-auto pr-1" : ""}>
                {children}
            </div>
        </div>
    );
}