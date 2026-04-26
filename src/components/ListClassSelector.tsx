import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import type { DomainHierarchy, HierarchyNode } from "../types/DomainClass.ts";

type ClassSelectorProps = {
	selectedClass?: string;
	hierarchy: DomainHierarchy;
	onSelect?: (name: string) => void;
};

type HierarchyItemProps = {
	node: HierarchyNode;
	depth: number;
	selectedClass?: string;
	onSelect?: (name: string) => void;
};

function containsSelected(node: HierarchyNode, selectedClass?: string): boolean {
	if (!selectedClass) return false;
	if (node.name === selectedClass) return true;
	return node.children.some((c) => containsSelected(c, selectedClass));
}

function HierarchyItem({ node, depth, selectedClass, onSelect }: HierarchyItemProps) {
	const hasChildren = node.children.length > 0;
	const isSelected = selectedClass === node.name;
	const shouldAutoOpen = hasChildren && node.children.some((c) => containsSelected(c, selectedClass));
	const [open, setOpen] = useState(shouldAutoOpen);

	useEffect(() => {
		if (shouldAutoOpen) setOpen(true);
	}, [shouldAutoOpen]);

	return (
		<div className="flex flex-col">
			<div
				className={`flex items-center gap-2 py-0.5 cursor-pointer rounded`}
				style={{ paddingLeft: depth * 16 }}
			>
				<span
					className="w-4 flex justify-center text-gray-400 cursor-pointer hover:text-black"
					onClick={() => {
						if (hasChildren) setOpen((v) => !v);
					}}
				>
					{hasChildren ? (
						open ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />
					) : null}
				</span>
				<div className={`cursor-pointer hover:bg-gray-100 w-full select-none px-1 rounded ${isSelected ? 'bg-accent-bg text-accent font-medium' : ''}`}
					  onClick={() => onSelect?.(node.name)}>
					{node.name}
				</div>
			</div>

			{hasChildren && open && (
				<div className="flex flex-col">
					{node.children.map((c) => (
						<HierarchyItem
							key={`${c.name}-${depth}`}
							node={c}
							depth={depth + 1}
							selectedClass={selectedClass}
							onSelect={onSelect}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function ListClassSelector({
	selectedClass,
	hierarchy,
	onSelect,
}: ClassSelectorProps) {
	return (
		<div className="flex flex-col gap-2 text-xs border p-2 half-rounded">
			<div className="flex justify-between">
				<div className="text-gray-600">
					{hierarchy.totalTopClasses} classes with {hierarchy.totalSubclasses} subclasses
				</div>

				{
					selectedClass ? <div className="text-accent">{selectedClass}</div> :
						<div>Select a class</div>
				}
			</div>

			<div className="flex flex-col max-h-100 overflow-y-auto">
				{hierarchy.hierarchy.map((h) => (
					<HierarchyItem
						key={h.name}
						node={h}
						depth={0}
						selectedClass={selectedClass}
						onSelect={onSelect}
					/>
				))}
			</div>
		</div>
	);
}
