import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight, FaPen, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DomainHierarchy, HierarchyNode } from "../types/DomainClass.ts";
import { editClassSchema, type EditClassForm } from "../schemas/EditClassForm.ts";
import ConfirmationModal from "./ConfirmationModal.tsx";
import Modal from "./Modal.tsx";
import InputField from "./InputField.tsx";
import Select from "./Select.tsx";
import Button from "./Button.tsx";

type ClassSelectorProps = {
	selectedClass?: string;
	hierarchy: DomainHierarchy;
	domainClasses: string[];
	onSelect?: (name: string) => void;
	onAdd?: (form: EditClassForm) => void;
	onEdit?: (originalName: string, newName: string) => void;
	onDelete?: (node: HierarchyNode) => void;
};

type HierarchyItemProps = {
	node: HierarchyNode;
	depth: number;
	selectedClass?: string;
	onSelect?: (name: string) => void;
	onStartEdit?: (node: HierarchyNode) => void;
	onDelete?: (node: HierarchyNode) => void;
};

function containsSelected(node: HierarchyNode, selectedClass?: string): boolean {
	if (!selectedClass) return false;
	if (node.name === selectedClass) return true;
	return node.children.some((c) => containsSelected(c, selectedClass));
}

function HierarchyItem({ node, depth, selectedClass, onSelect, onStartEdit, onDelete }: HierarchyItemProps) {
	const [toBeDeletedClass, setToBeDeletedClass] = useState<HierarchyNode | undefined>(undefined);

	const hasChildren = node.children.length > 0;
	const isSelected = selectedClass === node.name;
	const shouldAutoOpen = hasChildren && node.children.some((c) => containsSelected(c, selectedClass));

	const [open, setOpen] = useState(shouldAutoOpen);

	function confirmDeleteClass(node: HierarchyNode) {
		setToBeDeletedClass(node);
	}

	function deleteClass(node: HierarchyNode) {
		setToBeDeletedClass(undefined);
		onDelete?.(node);
	}

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

				{ isSelected &&
					<div className="flex items-center gap-2 pr-4">
						<FaPen className="text-orange-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); onStartEdit?.(node); }} />
						<FaTrash className="text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); confirmDeleteClass(node); }} />
					</div>
				}
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
							onStartEdit={onStartEdit}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}

			<ConfirmationModal open={!!toBeDeletedClass} onCancel={() => setToBeDeletedClass(undefined)} onConfirm={() => deleteClass(toBeDeletedClass!)}>
				Are you sure you want to delete {toBeDeletedClass?.name}?
			</ConfirmationModal>
		</div>
	);
}

export default function ListClassSelector({
	selectedClass,
	hierarchy,
	domainClasses,
	onSelect,
	onAdd,
	onEdit,
	onDelete,
}: ClassSelectorProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingClass, setEditingClass] = useState<HierarchyNode | undefined>(undefined);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EditClassForm>({
		resolver: zodResolver(editClassSchema),
		defaultValues: { name: "", parent: "" },
		mode: "onBlur",
	});

	function startAddClass() {
		setEditingClass(undefined);
		reset({ name: "", parent: "" });
		setIsModalOpen(true);
	}

	function startEditClass(node: HierarchyNode) {
		setEditingClass(node);
		reset({ name: node.name, parent: "" });
		setIsModalOpen(true);
	}

	function closeModal() {
		setIsModalOpen(false);
		setEditingClass(undefined);
	}

	function onSubmit(data: EditClassForm) {
		if (editingClass) {
			if (data.name && data.name !== editingClass.name) {
				onEdit?.(editingClass.name, data.name);
			}
		} else {
			onAdd?.(data);
		}
		closeModal();
	}

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
						onStartEdit={startEditClass}
						onDelete={onDelete}
					/>
				))}
			</div>

			<div className="flex justify-end">
				<Button size="sm" onClick={startAddClass}>Add</Button>
			</div>

			<Modal width="32rem" open={isModalOpen} onClose={closeModal} title={editingClass ? "Edit class" : "Add class"}>
				<form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
					<InputField
						label="Name *"
						registration={register("name")}
						error={errors.name}
						size="md"
					/>

					{!editingClass && (
						<div className="flex flex-col gap-0.5">
							<label className="label text-lg!">Parent</label>
							<Select
								options={[{ label: "(no parent)", value: "" }, ...domainClasses.map((c) => ({ label: c, value: c }))]}
								placeholder="Select a parent class"
								registration={register("parent")}
								className="h-10"
								error={errors.parent}
							/>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<Button type="button" variant="secondary" onClick={closeModal}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							Save
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
