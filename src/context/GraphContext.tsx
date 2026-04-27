import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type GraphContextValue = {
    selectedInstances: string[];
    setSelectedInstances: (instances: string[]) => void;

    selectedRelationships: string[];
    setSelectedRelationships: (relationships: string[]) => void;

    detailInstances: string[];
    setDetailInstances: (instances: string[]) => void;

    detailRelationships: string[];
    setDetailRelationships: (relationships: string[]) => void;
};

const GraphContext = createContext<GraphContextValue | undefined>(undefined);

function useUrlList(searchParams: URLSearchParams, key: string) {
    const raw = searchParams.get(key) ?? "";
    return useMemo(() => raw.split(",").filter(Boolean), [raw]);
}

export function GraphProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedInstances = useUrlList(searchParams, "graphSelectedInstances");
    const selectedRelationships = useUrlList(searchParams, "graphSelectedRelationships");
    const detailInstances = useUrlList(searchParams, "graphDetailInstances");
    const detailRelationships = useUrlList(searchParams, "graphDetailRelationships");

    function writeList(key: string, value: string[]) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value.length > 0) {
                next.set(key, value.join(","));
            } else {
                next.delete(key);
            }
            return next;
        });
    }

    return (
        <GraphContext.Provider
            value={{
                selectedInstances,
                selectedRelationships,
                detailInstances,
                detailRelationships,
                setSelectedInstances: (v) => writeList("graphSelectedInstances", v),
                setSelectedRelationships: (v) => writeList("graphSelectedRelationships", v),
                setDetailInstances: (v) => writeList("graphDetailInstances", v),
                setDetailRelationships: (v) => writeList("graphDetailRelationships", v),
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}

export function useGraph(): GraphContextValue {
    const ctx = useContext(GraphContext);
    if (!ctx) throw new Error("useGraph must be used within GraphProvider");
    return ctx;
}
