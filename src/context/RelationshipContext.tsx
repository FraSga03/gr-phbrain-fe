import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
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

    selectedRelationshipInstanceId: string | null;
    setSelectedRelationshipInstanceId: (id: string | null) => void;
};

const RelationshipContext = createContext<RelationshipContextValue | undefined>(undefined);

export function RelationshipProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedDomain } = useDomain();
    const prevDomainRef = useRef<string | null>(null);

    const subjectClassesParam = searchParams.get("selectedSubjectClasses");
    const objectClassesParam = searchParams.get("selectedObjectClasses");

    const selectedSubjectClasses = useMemo(
        () => subjectClassesParam?.split("-").filter(Boolean) ?? [],
        [subjectClassesParam],
    );
    const selectedSubjectInstanceId = searchParams.get("selectedSubjectInstanceId");

    const selectedObjectClasses = useMemo(
        () => objectClassesParam?.split("-").filter(Boolean) ?? [],
        [objectClassesParam],
    );
    const selectedObjectInstanceId = searchParams.get("selectedObjectInstanceId");

    const selectedRelationship = searchParams.get("selectedRelationship");
    const selectedRelationshipInstanceId = searchParams.get("selectedRelationshipInstanceId");

    function setSelectedClasses(newSelectedClasses: string[], isSubject: boolean) {
        setSearchParams((prev) => {
            const { param1, param2 } = {
                param1: isSubject ? "selectedSubjectClasses" : "selectedObjectClasses",
                param2: isSubject ? "selectedSubjectInstanceId" : "selectedObjectInstanceId",
            }

            const next = new URLSearchParams(prev);
            const newValue = newSelectedClasses.length > 0 ? newSelectedClasses.join("-") : null;
            const currentValue = prev.get(param1);

            if (newValue) {
                next.set(param1, newValue);
            } else {
                next.delete(param1);
            }

            // Only clear the matching instance if the class path actually changed.
            if (currentValue !== newValue) {
                next.delete(param2);
            }
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
                if (prev.get(param1) !== instanceId) {
                    next.delete("selectedRelationshipInstanceId");
                }
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

    function setSelectedRelationshipInstanceId(id: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (id) {
                next.set("selectedRelationshipInstanceId", id);
                // Picking a relationship instance is mutually exclusive with picking
                // subject/object instances — clear them in the same update so the
                // URL stays consistent (multiple setSearchParams calls in a row
                // would clobber each other since they share the same closure).
                next.delete("selectedSubjectInstanceId");
                next.delete("selectedObjectInstanceId");
            } else {
                next.delete("selectedRelationshipInstanceId");
            }
            return next;
        });
    }

    function setSelectedRelationship(relationship: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const current = prev.get("selectedRelationship");
            if (relationship) {
                next.set("selectedRelationship", relationship);
            } else {
                next.delete("selectedRelationship");
            }
            // Only clear the instance pick when the relationship actually changes,
            // not on idempotent re-sets (which can fire when the dropdown re-renders).
            if (current !== relationship) {
                next.delete("selectedRelationshipInstanceId");
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
                next.delete("selectedRelationshipInstanceId");

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
            setSelectedRelationship,

            selectedRelationshipInstanceId,
            setSelectedRelationshipInstanceId
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
