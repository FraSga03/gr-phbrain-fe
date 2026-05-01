import SidebarItem from "./SidebarItem";
import type { ReactNode } from "react";
import type { SidebarItemConfig } from "../types/SidebarItemConfig.ts";
import { useUI } from "../context/UIProviderContext.tsx";

type SidebarProps = {
    items: SidebarItemConfig[];
    footer?: ReactNode;
};

export default function Sidebar({ items, footer }: SidebarProps) {
    const { isSidebarOpen } = useUI();
    const collapsed = !isSidebarOpen;
    const title = collapsed ? "GB" : "Gr@phBRAIN";
    return (
        <aside
            className={`h-screen bg-white half-rounded flex flex-col transition-all duration-300
            ${collapsed ? "w-20" : "w-64"}`}
        >
            <div className="h-16 text-accent flex items-center justify-center text-3xl font-bold border-b soft-border">
                {title}
            </div>

            <nav className="flex-1 flex flex-col p-2 gap-3 border-r soft-border">
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