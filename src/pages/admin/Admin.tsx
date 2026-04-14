import Sidebar from "../../components/Sidebar.tsx";
import { FaCode, FaFile, FaHome, FaMap, FaQuestion } from "react-icons/fa";
import { FaArrowPointer, FaCodeMerge } from "react-icons/fa6";
import Footer from "../../components/Footer.tsx";
import type { RouteObject, UIMatch } from "react-router";
import { useMatches } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const sidebarItems = [
    { label: "Dashboard", icon: <FaHome size={20} />, path: "/admin" },
    { label: "Record", icon: <FaFile size={20} />, path: "/admin/record" },
    { label: "Graph", icon: <FaArrowPointer size={20} />, path: "/admin/graph" },
    { label: "Merge", icon: <FaCodeMerge size={20} />, path: "/admin/merge" },
    { label: "Schema", icon: <FaMap size={20} />, path: "/admin/schema" },
    { label: "Prolog", icon: <FaCode size={20} />, path: "/admin/prolog" },
    { label: "Help", icon: <FaQuestion size={20} />, path: "/admin/help" },
];

type AppHandle = {
    title?: string;
};

export default function Admin() {
    const matches = useMatches() as UIMatch<unknown, AppHandle>[];

    const title: string =
        matches.find((m: RouteObject) => !!m.handle?.title)?.handle?.title ?? "Admin";

    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                title={collapsed ? "GB" : "Gr@phBRAIN"}
                items={sidebarItems}
                collapsed={collapsed}
                footer={<Footer collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />}
            />

            <main className="flex flex-col flex-1 bg-gray-50 min-h-0">
                <div className="text-3xl font-bold h-16 bg-white border-b soft-border half-rounded flex items-center px-2 shrink-0">
                    {title}
                </div>

                <div className="flex-1 overflow-y-auto p-2 min-h-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}