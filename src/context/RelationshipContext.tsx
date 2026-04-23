import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useDomain } from "./DomainContext.tsx";

export type RelationshipSelection = {
    classes: string[];
    instanceId: string | null;
};

export function buildRelationshipParams(
    currentSearch: string,
    subject: RelationshipSelection,
    object: RelationshipSelection
): string {
    const params = new URLSearchParams(currentSearch);

    // Set subject
    if (subject.classes.length > 0) {
        params.set("selectedSubjectClasses", subject.classes.join("-"));
    } else {
        params.delete("selectedSubjectClasses");
    }

    if (subject.instanceId) {
        params.set("selectedSubjectInstanceId", subject.instanceId);
    } else {
        params.delete("selectedSubjectInstanceId");
    }

    // Set object
    if (object.classes.length > 0) {
        params.set("selectedObjectClasses", object.classes.join("-"));
    } else {
        params.delete("selectedObjectClasses");
    }

    if (object.instanceId) {
        params.set("selectedObjectInstanceId", object.instanceId);
    } else {
        params.delete("selectedObjectInstanceId");
    }

    return params.toString();
}

type RelationshipContextValue = {
    selectedSubjectClasses: string[];
    selectedSubjectInstanceId: string | null;
    setSelectedSubjectClasses: (classes: string[]) => void;
    setSelectedSubjectInstanceId: (id: string | null) => void;

    selectedObjectClasses: string[];
    selectedObjectInstanceId: string | null;
    setSelectedObjectClasses: (classes: string[]) => void;
    setSelectedObjectInstanceId: (id: string | null) => void;

    selectedRelationship: string | null;
    setSelectedRelationship: (id: string | null) => void;
};

const RelationshipContext = createContext<RelationshipContextValue | undefined>(undefined);

export function RelationshipProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedDomain } = useDomain();
    const prevDomainRef = useRef<string | null>(null);

    const selectedSubjectClasses = searchParams.get("selectedSubjectClasses")?.split("-").filter(Boolean) ?? [];
    const selectedSubjectInstanceId = searchParams.get("selectedSubjectInstanceId");

    const selectedObjectClasses = searchParams.get("selectedObjectClasses")?.split("-").filter(Boolean) ?? [];
    const selectedObjectInstanceId = searchParams.get("selectedObjectInstanceId");

    const selectedRelationship = searchParams.get("selectedRelationship");

    function setSelectedClasses(newSelectedClasses: string[], isSubject: boolean) {
        setSearchParams((prev) => {
            const { param1, param2 } = {
                param1: isSubject ? "selectedSubjectClasses" : "selectedObjectClasses",
                param2: isSubject ? "selectedSubjectInstanceId" : "selectedObjectInstanceId",
            }

            const next = new URLSearchParams(prev);
            if (newSelectedClasses.length > 0) {
                next.set(param1, newSelectedClasses.join("-"));
            } else {
                next.delete(param1);
            }

            next.delete(param2);
            return next;
        });
    }

    function setSelectedSubjectClasses(newSelectedClasses: string[]) {
        setSelectedClasses(newSelectedClasses, true);
    }

    function setSelectedObjectClasses(newSelectedClasses: string[]) {
        setSelectedClasses(newSelectedClasses, false);
    }

    function setSelectedInstanceId(instanceId: string | null, isSubject: boolean) {
        setSearchParams((prev) => {
            const { param1 } = { param1: isSubject ? "selectedSubjectInstanceId" : "selectedObjectInstanceId" }

            const next = new URLSearchParams(prev);
            if (instanceId) {
                next.set(param1, instanceId);
            } else {
                next.delete(param1);
            }
            return next;
        });
    }

    function setSelectedSubjectInstanceId(instanceId: string | null,) {
        setSelectedInstanceId(instanceId, true);
    }

    function setSelectedObjectInstanceId(instanceId: string | null,) {
        setSelectedInstanceId(instanceId, false);
    }

    function setSelectedRelationship(relationship: string | null) {
        setSearchParams((prev) => {

            const next = new URLSearchParams(prev);
            if (relationship) {
                next.set("selectedRelationship", relationship);
            } else {
                next.delete("selectedRelationship");
            }
            return next;
        });
    }

    useEffect(() => {
        // Only clear relationship params if domain actually changed (not on initial mount)
        if (prevDomainRef.current !== null && selectedDomain !== prevDomainRef.current && (selectedSubjectClasses.length > 0 || selectedSubjectInstanceId)) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("selectedSubjectClasses");
                next.delete("selectedObjectClasses");
                next.delete("selectedSubjectInstanceId");
                next.delete("selectedObjectInstanceId");
                next.delete("selectedRelationship");

                return next;
            });
        }
        prevDomainRef.current = selectedDomain;
    }, [selectedDomain]);

    return (
        <RelationshipContext.Provider value={{
            selectedSubjectClasses,
            selectedSubjectInstanceId,
            setSelectedSubjectClasses,
            setSelectedSubjectInstanceId,

            selectedObjectClasses,
            selectedObjectInstanceId,
            setSelectedObjectClasses,
            setSelectedObjectInstanceId,

            selectedRelationship,
            setSelectedRelationship
        }}>
            {children}
        </RelationshipContext.Provider>
    );
}

export function useRelationship(): RelationshipContextValue {
    const ctx = useContext(RelationshipContext);
    if (!ctx) throw new Error("useRelationship must be used within RelationshipProvider");
    return ctx;
}
