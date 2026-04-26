import type { Property } from "../types/ClassNode.ts";
import type { Column } from "../types/Table.ts";
import Table from "./Table.tsx";
import { useMemo, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newPropertySchema, type NewPropertyForm } from "../schemas/NewPropertyForm.ts";
import { editValueSchema, type EditValueForm } from "../schemas/EditValueForm.ts";
import Button from "./Button.tsx";
import Modal from "./Modal.tsx";
import InputField from "./InputField.tsx";
import Select from "./Select.tsx";
import { FaPen, FaTrash } from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal.tsx";

type PropertyRow = Property & { propertyName: string };

type PropertiesTableProps = {
    properties: Array<PropertyRow>;
    selectedProperty?: string | null;
    onSelectProperty?: (name: string | null) => void;
    onAddProperty?: (property: PropertyRow) => void;
    onEditProperty?: (originalName: string, property: PropertyRow) => void;
    onDeleteProperty?: (originalName: string, property: PropertyRow) => void;
    onAddValue?: (property: PropertyRow, newValue: string) => void;
    onEditValue?: (property: PropertyRow, originalValue: string, newValue: string) => void;
    onDeleteValue?: (property: PropertyRow, value: string) => void;
};

export default function PropertiesTable({
    properties,
    selectedProperty,
    onSelectProperty,
    onAddProperty,
    onEditProperty,
    onDeleteProperty,
    onAddValue,
    onEditValue,
    onDeleteValue,
}: PropertiesTableProps) {
    const [isPropModalOpen, setIsPropModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [editValue, setEditValue] = useState<string | null>(null);
    const [toBeDeletedProperty, setToBeDeletedProperty] = useState<PropertyRow | undefined>(undefined);
    const [toBeDeletedValue, setToBeDeletedValue] = useState<string | undefined>(undefined);
    const [editingName, setEditingName] = useState<string | null>(null);

    const propertyForm = useForm<NewPropertyForm>({
        resolver: zodResolver(newPropertySchema),
        defaultValues: { propertyName: "", type: "string", required: false, unique: false },
        mode: "onBlur",
    });

    const valueForm = useForm<EditValueForm>({
        resolver: zodResolver(editValueSchema),
        defaultValues: { value: "" },
        mode: "onBlur",
    });

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
                    <FaPen className="text-orange-300 cursor-pointer" onClick={() => editProperty(row)} />
                    <FaTrash className="text-red-400 cursor-pointer" onClick={() => confirmDeleteProperty(row)} />
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
                <div className="flex justify-end gap-4">
                    <FaPen className="text-orange-300 cursor-pointer" onClick={() => startEditValue(row.value)} />
                    <FaTrash className="text-red-400 cursor-pointer" onClick={() => setToBeDeletedValue(row.value)} />
                </div>
        }
    ];

    const rows = properties.map((p) => ({
        ...p,
        selected: p.propertyName === selectedProperty,
    }));

    function confirmDeleteProperty(property: PropertyRow) {
        setToBeDeletedProperty(property);
    }

    function deleteProperty(property: PropertyRow) {
        setToBeDeletedProperty(undefined);
        onDeleteProperty?.(property.propertyName, property);
    }

    function addProperty() {
        setEditingName(null);
        propertyForm.reset({ propertyName: "", type: "string", required: false, unique: false });
        setIsPropModalOpen(true);
    }

    function editProperty(row: PropertyRow) {
        setEditingName(row.propertyName);
        propertyForm.reset({
            propertyName: row.propertyName,
            type: Array.isArray(row.type) ? "list" : row.type,
            required: row.required,
            unique: row.unique,
        });
        setIsPropModalOpen(true);
    }

    function closePropertyModal() {
        setIsPropModalOpen(false);
        setEditingName(null);
    }

    function startAddValue() {
        setEditValue(null);
        valueForm.reset({ value: "" });
        setIsValueModalOpen(true);
    }

    function startEditValue(value: string) {
        setEditValue(value);
        valueForm.reset({ value });
        setIsValueModalOpen(true);
    }

    function closeValueModal() {
        setIsValueModalOpen(false);
        setEditValue(null);
    }

    function closeDeleteModal() {
        setToBeDeletedProperty(undefined);
    }

    function deleteValue(value: string) {
        setToBeDeletedValue(undefined);
        if (selectedPropertyData) onDeleteValue?.(selectedPropertyData, value);
    }

    function onSubmitProperty(data: NewPropertyForm) {
        const editedRow = editingName ? properties.find((p) => p.propertyName === editingName) : null;
        const property: PropertyRow = {
            propertyName: data.propertyName,
            type: data.type === "list"
                ? (Array.isArray(editedRow?.type) ? editedRow!.type : [])
                : data.type,
            required: data.required,
            unique: data.unique,
        };
        if (editingName) {
            onEditProperty?.(editingName, property);
        } else {
            onAddProperty?.(property);
        }
        closePropertyModal();
    }

    function onSubmitValue(data: EditValueForm) {
        if (!selectedPropertyData) return;
        if (editValue !== null) {
            if (data.value !== editValue) onEditValue?.(selectedPropertyData, editValue, data.value);
        } else {
            onAddValue?.(selectedPropertyData, data.value);
        }
        closeValueModal();
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
                <Button size="sm" onClick={addProperty}>
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
                                    <Button size="sm" onClick={startAddValue}>
                                        Aggiungi
                                    </Button>
                                </div>
                            </div>

                            : "Primitive type"
                        }
                    </div>
                </>
            }

            <Modal width="40rem" open={isPropModalOpen} onClose={closePropertyModal} title={editingName ? "Edit property" : "Add property"}>
                <form className="grid grid-cols-2 gap-3" onSubmit={propertyForm.handleSubmit(onSubmitProperty)}>
                    <InputField
                        label="Name *"
                        registration={propertyForm.register("propertyName")}
                        error={propertyForm.formState.errors.propertyName as FieldError | undefined}
                        size="md"
                    />

                    <div className="flex flex-col gap-0.5">
                        <label className="label text-lg!">Type *</label>
                        <Select
                            options={[
                                { label: "string", value: "string" },
                                { label: "number", value: "number" },
                                { label: "date", value: "date" },
                                { label: "list", value: "list" },
                            ]}
                            placeholder="Select a type"
                            registration={propertyForm.register("type")}
                            className="h-10"
                            error={propertyForm.formState.errors.type as FieldError | undefined}
                        />
                    </div>

                    <div className="grid grid-flow-row gap-3 col-span-2 cursor-pointer">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...propertyForm.register("required")} />
                            Required
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...propertyForm.register("unique")} />
                            Unique
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 col-span-2">
                        <Button type="button" variant="secondary" onClick={closePropertyModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={propertyForm.formState.isSubmitting}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal width="40rem" open={isValueModalOpen} onClose={closeValueModal} title={editValue !== null ? "Edit value" : "Add value"}>
                <form className="flex flex-col gap-3" onSubmit={valueForm.handleSubmit(onSubmitValue)}>
                    <InputField
                        label="Value *"
                        registration={valueForm.register("value")}
                        error={valueForm.formState.errors.value as FieldError | undefined}
                        size="md"
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={closeValueModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={valueForm.formState.isSubmitting}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal open={!!toBeDeletedProperty} onCancel={closeDeleteModal} onConfirm={() => deleteProperty(toBeDeletedProperty!)}>
                Are you sure you want to delete {toBeDeletedProperty?.propertyName} property?
            </ConfirmationModal>

            <ConfirmationModal open={!!toBeDeletedValue} onCancel={() => setToBeDeletedValue(undefined)} onConfirm={() => deleteValue(toBeDeletedValue!)}>
                Are you sure you want to delete value "{toBeDeletedValue}"?
            </ConfirmationModal>
        </div>
    );
}
