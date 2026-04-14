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
            onClick={() => navigate(path)}
            className={`flex items-center cursor-pointer transition duration-150 half-rounded
                border border-gray-500 bg-white shadow-sm
                ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
                ${isActive ? "bg-(--accent-bg)! text-(--accent)" : "hover:bg-gray-200"}
            `}
        >
            <div className="text-2xl">{icon}</div>

            {!collapsed && (
                <span className="font-medium">{label}</span>
            )}
        </div>
    );
}