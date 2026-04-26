import type { Property } from "../types/ClassNode.ts";
import type { Column } from "../types/Table.ts";
import Table from "./Table.tsx";
import { useMemo } from "react";
import Button from "./Button.tsx";
import { FaPen, FaTrash } from "react-icons/fa";

type PropertyRow = Property & { propertyName: string };

type PropertiesTable = {
    properties: Array<PropertyRow>;
    selectedProperty?: string | null;
    onSelectProperty?: (name: string | null) => void;
};

export default function PropertiesTable({ properties, selectedProperty, onSelectProperty }: PropertiesTable) {
    const propertiesColumn: Column<PropertyRow>[] = [
        { key: "propertyName", header: "Property" },
        { key: "type", header: "Type" },
        { key: "required", header: "Required" },
        { key: "unique", header: "Unique" },
        {
            key: "empty",
            header: "",
            render: (_, row) =>
                <div className="flex justify-end gap-4">
                    <FaPen className="text-orange-300 cursor-pointer" onClick={() => deleteValue(row)} />
                    <FaTrash className="text-red-400 cursor-pointer" onClick={() => deleteValue(row)} />
                </div>
        }
    ];

    const selectedPropertyData = useMemo(() => properties?.find(p => p.propertyName === selectedProperty), [selectedProperty, properties]);

    const valueColumns: Column<{ value: string }>[] = [
        { key: "value", header: "Value" },
        {
            key: "empty",
            header: "",
            render: (_, row) =>
                <div className="flex justify-end">
                    <FaTrash color="red" className="text-red-400 cursor-pointer" onClick={() => deleteValue(row)} />
                </div>
        }
    ];

    const rows = properties.map((p) => ({
        ...p,
        selected: p.propertyName === selectedProperty,
    }));

    function deleteValue(property: string) {
        console.log("deleteValue", property);
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="[&>div]:min-h-0! [&>div>div:first-child]:max-h-72 [&>div>div:first-child]:overflow-y-auto">
                <Table
                    data={rows}
                    columns={propertiesColumn}
                    onRowClick={(row) => {
                        const next = row.propertyName === selectedProperty ? null : row.propertyName;
                        onSelectProperty?.(next);
                    }}
                />
            </div>

            <div className="flex justify-end">
                <Button size="sm">
                    Aggiungi
                </Button>
            </div>

            {
                selectedPropertyData &&
                <>
                    <div className="text-accent text-lg">
                        Values
                    </div>

                    <div>
                        { Array.isArray(selectedPropertyData.type) ?
                            <div className="flex flex-col gap-1">
                                <div className="[&>div]:min-h-0! [&>div>div:first-child]:max-h-72 [&>div>div:first-child]:overflow-y-auto">
                                    <Table
                                        data={selectedPropertyData.type.map((v) => ({ value: v }))}
                                        columns={valueColumns}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button size="sm">
                                        Aggiungi
                                    </Button>
                                </div>
                            </div>

                            : "Primitive type"
                        }
                    </div>
                </>
            }
        </div>

    );
}