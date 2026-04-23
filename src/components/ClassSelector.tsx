import { FaChevronRight } from "react-icons/fa";
import Select from "./Select.tsx";
import Pill from "./Pill.tsx";
import type { Option } from "../types/Select.ts";

type ClassSelectorProps = {
	selectedPath: string[];
	domainName: string;
	subclassOptions: Option[];
	onClearPath: () => void;
	onRewindPath: (key: string) => void;
	onSelectSubclass: (value: string) => void;
};

export default function ClassSelector({
	selectedPath,
	domainName,
	subclassOptions,
	onClearPath,
	onRewindPath,
	onSelectSubclass,
}: ClassSelectorProps) {
	return (
		<div className="flex flex-col gap-2 text-sm">
			<div className="flex flex-wrap items-center gap-2">
				<Pill onClick={onClearPath} title={domainName} />

				{selectedPath.map((key: string, idx: number) => (
					<div key={idx} className="flex items-center gap-2">
						<FaChevronRight className="text-gray-400" />
						<Pill onClick={() => onRewindPath(key)} title={key} />
					</div>
				))}
			</div>

			<div className={`${!subclassOptions.length ? 'opacity-30' : ''}`}>
				<Select
					options={subclassOptions}
					placeholder="Select subclass"
					onChange={onSelectSubclass}
					disabled={!subclassOptions.length}
					className="h-10"
				/>
			</div>
		</div>
	);
}
