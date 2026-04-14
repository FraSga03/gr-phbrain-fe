import SidebarItem from "./SidebarItem";
import type { ReactNode } from "react";
import type { SidebarItemConfig } from "../types/SidebarItemConfig.ts";

type SidebarProps = {
    items: SidebarItemConfig[];
    title?: string;
    collapsed: boolean;
    footer?: ReactNode;
};

export default function Sidebar({ items, title = "App", footer, collapsed }: SidebarProps) {
    return (
        <aside
            className={`h-screen bg-white half-rounded flex flex-col transition-all duration-300
            ${collapsed ? "w-20" : "w-64"}`}
        >
            <div className="h-16 text-accent flex items-center justify-center text-3xl font-bold border-b soft-border">
                {title}
            </div>

            <nav className="flex-1 p-2 space-y-2 border-r soft-border">
                {items.map((item) => (
                    <SidebarItem
                        key={item.path}
                        label={item.label}
                        icon={item.icon}
                        path={item.path}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {footer && (
                <div className="p-2 text-xs text-gray-500 border-r soft-border half-rounded">
                    {footer}
                </div>
            )}
        </aside>
    );
}