import Select from "./Select.tsx";
import Button from "./Button.tsx";
import type { Option } from "../types/Select.ts";

export type InstanceButton = {
	label: string;
	onClick: () => void;
	variant?: "primary" | "secondary";
};

type InstanceSelectorProps = {
	instanceOptions: Option[];
	selectedInstanceId: string | null;
	onSelectInstance: (id: string) => void;
	buttons: InstanceButton[];
};

export default function InstanceSelector({
	instanceOptions,
	selectedInstanceId,
	onSelectInstance,
	buttons,
}: InstanceSelectorProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className={`flex flex-col gap-2 text-sm ${!instanceOptions.length ? 'opacity-30' : ''}`}>
				<Select
					options={instanceOptions}
					placeholder="Select instance"
					onChange={onSelectInstance}
					disabled={!instanceOptions.length}
					value={selectedInstanceId ?? ''}
					className="h-10"
				/>
			</div>

			{buttons.length > 0 && (
				<div className="flex justify-end gap-2">
					{buttons.map((btn, idx) => (
						<Button
							key={idx}
							variant={btn.variant ?? "secondary"}
							onClick={btn.onClick}
							disabled={!selectedInstanceId}
						>
							{btn.label}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}
