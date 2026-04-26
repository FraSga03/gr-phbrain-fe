import { createContext, useContext, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type GraphContextValue = {
    selectedInstances: string[];
    setSelectedInstances: (instances: string[]) => void;

    selectedRelationships: string[];
    setSelectedRelationships: (relationships: string[]) => void;
};

const GraphContext = createContext<GraphContextValue | undefined>(undefined);

export function GraphProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedInstances = searchParams.get("graphSelectedInstances")?.split(",").filter(Boolean) ?? [];
    const selectedRelationships = searchParams.get("graphSelectedRelationships")?.split(",").filter(Boolean) ?? [];

    function setSelectedInstances(graphSelectedInstances: string[]) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (graphSelectedInstances.length > 0) {
                next.set("graphSelectedInstances", graphSelectedInstances.join(","));
            } else {
                next.delete("graphSelectedInstances");
            }

            return next;
        });
    }

    function setSelectedRelationships(graphSelectedRelationships: string[]) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (graphSelectedRelationships.length > 0) {
                next.set("graphSelectedRelationships", graphSelectedRelationships.join(","));
            } else {
                next.delete("graphSelectedRelationships");
            }

            return next;
        });
    }

    return (
        <GraphContext.Provider value={{ selectedInstances, selectedRelationships, setSelectedInstances, setSelectedRelationships }}>
            {children}
        </GraphContext.Provider>
    );
}

export function useGraph(): GraphContextValue {
    const ctx = useContext(GraphContext);
    if (!ctx) throw new Error("useGraph must be used within GraphProvider");
    return ctx;
}
