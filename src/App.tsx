import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";

import Login from "./pages/login/Login";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Record from "./pages/admin/Record";
import Graph from "./pages/admin/Graph";
import Merge from "./pages/admin/Merge";
import Schema from "./pages/admin/Schema";
import Prolog from "./pages/admin/Prolog";
import Help from "./pages/admin/Help";

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
                path: "record",
                element: <Record />,
                handle: { title: "Record" },
            },
            {
                path: "graph",
                element: <Graph />,
                handle: { title: "Graph" },
            },
            {
                path: "merge",
                element: <Merge />,
                handle: { title: "Merge" },
            },
            {
                path: "schema",
                element: <Schema />,
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
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}