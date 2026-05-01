import { useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

type SidebarItemProps = {
    label: string;
    icon: ReactNode;
    path: string;
    collapsed: boolean;
};

export default function SidebarItem({
    label,
    icon,
    path,
    collapsed = false,
}: SidebarItemProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = location.pathname === path;

    return (
        <div
            onClick={() => navigate(path + location.search)}
            title={collapsed ? label : undefined}
            className={`group relative flex items-center cursor-pointer transition duration-150 half-rounded
                border border-gray-500 bg-white shadow-sm
                ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
                ${isActive ? "bg-(--accent-bg)! text-(--accent)" : "hover:bg-gray-200"}
            `}
        >
            <div className="text-2xl">{icon}</div>

            {!collapsed && (
                <span className="font-medium">{label}</span>
            )}

            {collapsed && (
                <span
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1
                        rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow
                        opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                >
                    {label}
                </span>
            )}
        </div>
    );
}