import { createContext, useContext, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type SelectionContextValue = {
    selectedClasses: string[];
    selectedInstanceId: string | null;
    setSelectedClasses: (classes: string[]) => void;
    setSelectedInstanceId: (id: string | null) => void;
};

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedClasses = searchParams.get("selectedClasses")?.split("-").filter(Boolean) ?? [];
    const selectedInstanceId = searchParams.get("instanceId");

    function setSelectedClasses(newSelectedClasses: string[]) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (newSelectedClasses.length > 0) {
                next.set("selectedClasses", newSelectedClasses.join("-"));
            } else {
                next.delete("selectedClasses");
            }

            next.delete("instanceId");
            return next;
        });
    }

    function setSelectedInstanceId(instanceId: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (instanceId) {
                next.set("instanceId", instanceId);
            } else {
                next.delete("instanceId");
            }
            return next;
        });
    }

    return (
        <SelectionContext.Provider value={{ selectedClasses, selectedInstanceId, setSelectedClasses, setSelectedInstanceId }}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection(): SelectionContextValue {
    const ctx = useContext(SelectionContext);
    if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
    return ctx;
}
