import Sidebar from "../../components/Sidebar.tsx";
import { FaCode, FaFile, FaHome, FaMap, FaQuestion } from "react-icons/fa";
import { FaArrowPointer, FaCodeMerge } from "react-icons/fa6";
import Footer from "../../components/Footer.tsx";
import type { RouteObject, UIMatch } from "react-router";
import { useMatches, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import TopBar from "../../components/TopBar.tsx";
import Spinner from "../../components/Spinner.tsx";
import { DomainProvider } from "../../context/DomainContext.tsx";
import { SelectionProvider } from "../../context/SelectionContext.tsx";
import { RelationshipProvider } from "../../context/RelationshipContext.tsx";
import { GraphProvider } from "../../context/GraphContext.tsx";

const sidebarItems = [
    { label: "Dashboard", icon: <FaHome size={20} />, path: "/admin" },
    { label: "Entities", icon: <FaFile size={20} />, path: "/admin/entities" },
    { label: "Relationships", icon: <FaArrowPointer size={20} />, path: "/admin/relationships" },
    { label: "Graph", icon: <FaCodeMerge size={20} />, path: "/admin/graph" },
    { label: "Schema", icon: <FaMap size={20} />, path: "/admin/schema" },
    { label: "Prolog", icon: <FaCode size={20} />, path: "/admin/prolog" },
    { label: "Help", icon: <FaQuestion size={20} />, path: "/admin/help" },
];

type AppHandle = {
    title?: string;
};

export default function Admin() {
    const matches = useMatches() as UIMatch<unknown, AppHandle>[];
    const navigate = useNavigate();
    const { error, loading } = useAuth();

    const title: string =
        matches.find((m: RouteObject) => !!m.handle?.title)?.handle?.title ?? "Admin";

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!loading && error) navigate("/login", { replace: true });
    }, [loading, error, navigate]);

    if (loading) return <Spinner />;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                title={collapsed ? "GB" : "Gr@phBRAIN"}
                items={sidebarItems}
                collapsed={collapsed}
                footer={<Footer collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />}
            />

            <DomainProvider>
                <SelectionProvider>
                    <RelationshipProvider>
                        <GraphProvider>
                            <main className="flex flex-col flex-1 bg-gray-50 min-h-0">
                                <TopBar title={title} />

                                <div className="flex-1 overflow-y-auto p-2 min-h-0">
                                    <Outlet />
                                </div>
                            </main>
                        </GraphProvider>
                    </RelationshipProvider>
                </SelectionProvider>
            </DomainProvider>
        </div>
    );
}