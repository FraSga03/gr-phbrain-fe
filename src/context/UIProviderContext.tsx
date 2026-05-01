import { createContext, useContext, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type UIContextValue = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();

    const isSidebarOpen = !!(+(searchParams.get("isSidebarOpen") ?? '0'));

    function setIsSidebarOpen(isOpen: boolean | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (isOpen !== null) {
                next.set("isSidebarOpen", isOpen ? "1" : "0");
            } else {
                next.delete("isSidebarOpen");
            }

            return next;
        });
    }

    return (
        <UIContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI(): UIContextValue {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error("useUI must be used within UIProvider");
    return ctx;
}
