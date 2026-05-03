import Sidebar from "../../components/Sidebar.tsx";
import { FaHome, FaQuestion } from "react-icons/fa";
import { FaCube, FaLink, FaDiagramProject, FaSitemap, FaTerminal } from "react-icons/fa6";
import Footer from "../../components/Footer.tsx";
import type { RouteObject, UIMatch } from "react-router";
import { useMatches, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.tsx";
import TopBar from "../../components/TopBar.tsx";
import Spinner from "../../components/Spinner.tsx";
import { DomainProvider } from "../../contexts/DomainContext.tsx";
import { SelectionProvider } from "../../contexts/SelectionContext.tsx";
import { RelationshipProvider } from "../../contexts/RelationshipContext.tsx";
import { GraphProvider } from "../../contexts/GraphContext.tsx";
import { UIProvider } from "../../contexts/UIProviderContext.tsx";

const sidebarItems = [
    { label: "Dashboard", icon: <FaHome size={20} />, path: "/admin" },
    { label: "Entities", icon: <FaCube size={20} />, path: "/admin/entities" },
    { label: "Relationships", icon: <FaLink size={20} />, path: "/admin/relationships" },
    { label: "Graph", icon: <FaDiagramProject size={20} />, path: "/admin/graph" },
    { label: "Schema", icon: <FaSitemap size={20} />, path: "/admin/schema" },
    { label: "Prolog", icon: <FaTerminal size={20} />, path: "/admin/prolog" },
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

    useEffect(() => {
        if (!loading && error) navigate("/login", { replace: true });
    }, [loading, error, navigate]);

    if (loading) return <Spinner />;

    return (
        <div className="flex h-screen overflow-hidden">
            <UIProvider>
                <Sidebar items={sidebarItems} footer={<Footer />} />

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
            </UIProvider>
        </div>
    );
}