import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.tsx";

import Login from "./pages/login/Login";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Entity from "./pages/admin/Entity.tsx";
import Graph from "./pages/admin/Graph.tsx";
import Schema from "./pages/admin/Schema";
import Prolog from "./pages/admin/Prolog";
import Help from "./pages/admin/Help";
import Relationship from "./pages/admin/Relationship.tsx";
import Profile from "./pages/admin/Profile.tsx";
import { SchemaProvider } from "./context/SchemaContext.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/admin",
        element: <Admin />,
        children: [
            {
                index: true,
                element: <Dashboard />,
                handle: { title: "Dashboard" },
            },
            {
                path: "entities",
                element: <Entity />,
                handle: { title: "Entities" },
            },
            {
                path: "relationships",
                element: <Relationship />,
                handle: { title: "Relationships" },
            },
            {
                path: "graph",
                element: <Graph />,
                handle: { title: "Graph" },
            },
            {
                path: "schema",
                element: (
                    <SchemaProvider>
                        <Schema />
                    </SchemaProvider>
                ),
                handle: { title: "Schema" },
            },
            {
                path: "prolog",
                element: <Prolog />,
                handle: { title: "Prolog" },
            },
            {
                path: "help",
                element: <Help />,
                handle: { title: "Help" },
            },
            {
                path: "profile",
                element: <Profile />,
                handle: { title: "Profile" },
            },
        ],
    },
]);

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="bottom-right" />
        </AuthProvider>
    );
}