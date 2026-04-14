import React from "react";

type CardProps = {
    children: React.ReactNode;
    className?: string;
    title?: React.ReactNode; // 👈 flexible (string or JSX)
};

export default function Card({ children, className = "", title }: CardProps) {
    return (
        <div className={`card p-6 half-rounded flex flex-col gap-4 ${className}`}>
            {title && (
                <div className="text-accent text-xl font-semibold leading-none">
                    {title}
                </div>
            )}

            <div>
                {children}
            </div>
        </div>
    );
}