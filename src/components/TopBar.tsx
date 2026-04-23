import Select from "./Select.tsx";
import { useDomain } from "../context/DomainContext.tsx";
import { useMemo } from "react";
import type { Option } from "../types/Select.ts";

type TopBarProps = {
    title: string;
};

export default function TopBar({ title }: TopBarProps) {
    const { domains, selectedDomain, setSelectedDomain } = useDomain();

    const domainOptions = useMemo<Option[]>(
        () => (domains ?? []).map(d => ({ label: d, value: d })),
        [domains]
    );

    return (
        <div className="h-16 bg-white border-b soft-border half-rounded flex items-center justify-between px-2 shrink-0">
            <span className="text-3xl font-bold">
                {title}
            </span>

            <div className="flex items-center gap-2">
                <span className="text-lg">domain</span>
                <Select
                    options={domainOptions}
                    placeholder="Select domain"
                    value={selectedDomain ?? ""}
                    onChange={setSelectedDomain}
                    className="h-8 text-sm"
                />
            </div>
        </div>
    );
}