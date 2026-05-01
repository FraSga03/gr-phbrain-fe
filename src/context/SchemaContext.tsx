import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useDomain } from "./DomainContext.tsx";
import type { UploadedFile } from "../types/Schema.ts";

type SchemaContextValue = {
    selectedClasses: string[];
    setSelectedClasses: (classes: string[]) => void;
    selectedClass: string | null;
    setSelectedClass: (name: string | null) => void;
    selectedProperty: string | null;
    setSelectedProperty: (name: string | null) => void;
    selectedRelationshipId: string | null;
    setSelectedRelationshipId: (name: string | null) => void;
    clearRelationshipSelection: () => void;
    uploadedFile: UploadedFile | null;
    setUploadedFile: (file: UploadedFile | null) => void;
};

const SchemaContext = createContext<SchemaContextValue | undefined>(undefined);

export function SchemaProvider({ children }: { children: ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedDomain } = useDomain();

    const selectedClasses = searchParams.get("selectedSchemaClasses")?.split("-").filter(Boolean) ?? [];
    const selectedClass = searchParams.get("selectedSchemaClass");
    const selectedProperty = searchParams.get("selectedSchemaProperty");
    const selectedRelationshipId = searchParams.get("selectedSchemaRelationshipId");
    const uploadedFileId = searchParams.get("uploadedFileId");
    const uploadedFileName = searchParams.get("uploadedFileName");
    const uploadedFile: UploadedFile | null =
        uploadedFileId && uploadedFileName ? { id: uploadedFileId, filename: uploadedFileName } : null;

    function setUploadedFile(file: UploadedFile | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (file) {
                next.set("uploadedFileId", file.id);
                next.set("uploadedFileName", file.filename);
            } else {
                next.delete("uploadedFileId");
                next.delete("uploadedFileName");
            }
            return next;
        });
    }

    function setSelectedClasses(newSelectedClasses: string[]) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (newSelectedClasses.length > 0) {
                next.set("selectedSchemaClasses", newSelectedClasses.join("-"));
            } else {
                next.delete("selectedSchemaClasses");
            }
            return next;
        });
    }

    function setSelectedClass(name: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (name) {
                next.set("selectedSchemaClass", name);
            } else {
                next.delete("selectedSchemaClass");
            }
            next.delete("selectedSchemaProperty");
            return next;
        });
    }

    function setSelectedProperty(name: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (name) {
                next.set("selectedSchemaProperty", name);
            } else {
                next.delete("selectedSchemaProperty");
            }
            return next;
        });
    }

    function setSelectedRelationshipId(name: string | null) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (name) {
                next.set("selectedSchemaRelationshipId", name);
            } else {
                next.delete("selectedSchemaRelationshipId");
            }
            return next;
        });
    }

    // Clear relationship + property in a single setSearchParams call. React Router's
    // updater receives `prev` from the hook closure, so two sequential setters would
    // each operate on the original URL and clobber each other.
    function clearRelationshipSelection() {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("selectedSchemaRelationshipId");
            next.delete("selectedSchemaProperty");
            return next;
        });
    }

    const prevDomainRef = useRef<string | null>(selectedDomain);
    useEffect(() => {
        if (prevDomainRef.current === selectedDomain) return;
        prevDomainRef.current = selectedDomain;

        if (selectedDomain && (selectedClasses.length > 0 || selectedClass || selectedProperty || selectedRelationshipId || uploadedFileId || uploadedFileName)) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("selectedSchemaClasses");
                next.delete("selectedSchemaClass");
                next.delete("selectedSchemaProperty");
                next.delete("selectedSchemaRelationshipId");
                next.delete("uploadedFileId");
                next.delete("uploadedFileName");
                return next;
            });
        }
    }, [selectedDomain]);

    return (
        <SchemaContext.Provider value={{ selectedClasses, setSelectedClasses, selectedClass, setSelectedClass, selectedProperty, setSelectedProperty, selectedRelationshipId, setSelectedRelationshipId, clearRelationshipSelection, uploadedFile, setUploadedFile }}>
            {children}
        </SchemaContext.Provider>
    );
}

export function useSchema(): SchemaContextValue {
    const ctx = useContext(SchemaContext);
    if (!ctx) throw new Error("useSchema must be used within SchemaProvider");
    return ctx;
}
