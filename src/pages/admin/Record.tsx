import Card from "../../components/Card.tsx";
import  { type DomainClass } from "../../types/DomainClass.ts";
import { useMemo } from "react";
import { FaChevronRight } from "react-icons/fa";
import Select from "../../components/Select.tsx";
import type { Option } from "../../types/Select.ts";
import { type ChangeHandler, Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
import type { FormValues } from "../../types/Record.ts";
import Pill from "../../components/Pill.tsx";

export default function Record() {
    const domainClass: DomainClass = {
        name: "general",
        children: [
            { name: "document" },
            { name: "place", children: [ { name: "palace" }, { name: "street" } ]},
            { name: "collection" },
            { name: "item" },
        ],
    };

    const { control, watch, setValue } = useForm<FormValues>({
        defaultValues: {
            path: [],
        },
    });

    const path = watch("path");

    const currentNode = useMemo(() => {
        let current: DomainClass | undefined = domainClass;

        for (const key of path) {
            current = current?.children?.find((c) => c.name === key);
            if (!current) break;
        }

        return current;
    }, [domainClass, path]);

    const options: Option[] = useMemo(() => {
        return (
            currentNode?.children?.map((c) => ({
                label: c.name,
                value: c.name,
            })) ?? []
        );
    }, [currentNode]);

    const clearPath = () => {
        setValue("path", []);
    }

    const rewindPath = (key: string) => {
        const index = path.indexOf(key);
        if (index === -1) return;

        setValue("path", path.slice(0, index + 1));
    };

    const onSelect = (value: string) => {
        setValue("path", [...path, value]);
    };

    return (
        <div className="flex flex-col gap-4">

            <Card title="Select class">
                <div className="flex flex-col gap-2 text-sm">

                    <div className="flex flex-wrap items-center gap-2">
                        <Pill onClick={clearPath} title={domainClass.name} />

                        {path.map((key: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <FaChevronRight className="text-gray-400" />
                                <Pill onClick={() => rewindPath(key)} title={key} />
                            </div>
                        ))}
                    </div>

                    {options.length > 0 && (
                        <Controller
                            control={control}
                            name="path"
                            render={() => <Select
                                options={options}
                                placeholder="Select subclass"
                                registration={{
                                    onChange: ((e: { target: { value: string; }; }) => onSelect(e.target.value)) as ChangeHandler,
                                    name: "path",
                                } as UseFormRegisterReturn }
                            />}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}