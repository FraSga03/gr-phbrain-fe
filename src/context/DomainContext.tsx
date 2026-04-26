import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAll } from "../service/DomainService.ts";
import { useSearchParams } from "react-router-dom";

type DomainContextValue = {
    domains: string[] | undefined;
    selectedDomain: string | null;
    setSelectedDomain: (domain: string | null) => void;
};

const DomainContext = createContext<DomainContextValue | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
    const [domains, setDomains] = useState<string[] | undefined>(undefined);
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedDomain = searchParams.get("domain");

    function setSelectedDomain(domain: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (domain) {
                next.set("domain", domain);
            } else {
                next.delete("domain");
            }

            next.delete("selectedClasses");
            next.delete("instanceId");

            next.delete("selectedSchemaClasses");
            next.delete("selectedSchemaClass");
            next.delete("selectedSchemaProperty");
            next.delete("selectedSchemaRelationshipId");

            next.delete("selectedSubjectClasses");
            next.delete("selectedSubjectInstanceId");
            next.delete("selectedObjectClasses");
            next.delete("selectedObjectInstanceId");
            next.delete("selectedRelationship");

            next.delete("graphSelectedRelationships");
            next.delete("graphSelectedInstances");

            return next;
        });
    }

    useEffect(() => {
        getAll().then((ds) => {
            setDomains(ds);
            if (!selectedDomain) {
                setSelectedDomain(ds[0] ?? null);
            }
        });
    }, []);

    return (
        <DomainContext.Provider value={{ domains, selectedDomain, setSelectedDomain }}>
            {children}
        </DomainContext.Provider>
    );
}

export function useDomain(): DomainContextValue {
    const ctx = useContext(DomainContext);
    if (!ctx) throw new Error("useDomain must be used within DomainProvider");
    return ctx;
}
