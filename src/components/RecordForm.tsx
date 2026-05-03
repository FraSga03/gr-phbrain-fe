import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type { ClassNode } from "../types/ClassNode";
import InputField from "./InputField";
import Select from "./Select";
import Button from "./Button";
import toast from "react-hot-toast";
import type { Record } from "../types/Record.ts";
import { saveInstance as saveInstanceAPI, editInstance as editInstanceAPI } from "../services/DomainService.ts";

type RecordFormProps = {
    selectedInstance: Record | null;
    currentClass: ClassNode | undefined;
    currentDomain: string;
    onReset: () => void;
};

export default function RecordForm({ selectedInstance, currentClass, currentDomain, onReset }: RecordFormProps) {
    const {
        register,
        reset,
        handleSubmit,
        clearErrors,
        formState: { isSubmitting, errors }
    } = useForm({
        defaultValues: selectedInstance ?? {},
        mode: "onBlur",
    });

    useEffect(() => {
        if (selectedInstance) {
            reset(selectedInstance);
        } else {
            reset(
                Object.fromEntries(
                Object.keys(currentClass?.properties ?? {}).map(key => [key, null])
            ));
        }
    }, [selectedInstance, reset]);

    const saveInstance = async (data: Record) => {
        saveInstanceAPI(currentDomain, currentClass?.name ?? '', data as never)
            .then(() => {
                toast.success("Instance saved");
                reset(Object.fromEntries(Object.keys(currentClass?.properties ?? {}).map(key => [key, null])));
                clearErrors();
            });
    }

    const editInstance = async (data: Record) => {
        editInstanceAPI(currentDomain, selectedInstance?.__id ?? '', data as never)
            .then(() => {
                toast.success("Instance updated");
                clearErrors();
            })
    }

    const onSubmit = async (data: Record) => {
        if (selectedInstance) {
            await editInstance(data);
        } else {
            await saveInstance(data);
        }
    }

    function handleReset() {
        const propertyKeys = Object.keys(currentClass?.properties ?? {});
        if (selectedInstance) {
            const values = Object.fromEntries(
                propertyKeys.map(key => [key, (selectedInstance as Record)[key] ?? null])
            );
            reset(values);
        } else {
            reset(Object.fromEntries(propertyKeys.map(key => [key, null])));
            onReset();
        }
        clearErrors();
    }

    return (
        <>
            {Object.keys(currentClass?.properties ?? {}).length ? (
                <form className="flex flex-col flex-1 justify-between gap-3" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(currentClass?.properties ?? {}).map(([key, config]) => (
                            <div key={key}>
                                {config.type === "string" || config.type === "number" || config.type === "date" ? (
                                    <InputField
                                        label={`${key}${config.required ? ' *' : ''}`}
                                        type={config.type === "date" ? "date" : config.type}
                                        registration={register(key, { required: config.required ? `${key} is required` : false })}
                                        error={errors[key] as never}
                                        size="md"
                                    />
                                ) : Array.isArray(config.type) ? (
                                    <div className="flex flex-col gap-0.5">
                                        <label className="label text-lg!">{key}{config.required ? ' *' : ''}</label>
                                        <Select
                                            options={config.type.map((opt) => ({ label: opt, value: opt }))}
                                            placeholder={`Select ${key}`}
                                            registration={register(key, { required: config.required ? `${key} is required` : false })}
                                            className="h-10"
                                            error={errors[key] as never}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" onClick={handleReset} disabled={isSubmitting} variant="secondary">
                            Reset
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Loading..." : selectedInstance ? "Edit" : "Save"}
                        </Button>
                    </div>
                </form>
            ) : (
                <div>Select an instance to edit or select a class</div>
            )}
        </>
    );
}
