import type { DomainRelationships, Relationship } from "../types/Relationship.ts";
import { FaPen, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editRelationshipSchema, type EditRelationshipForm } from "../schemas/EditRelationshipForm.ts";
import ConfirmationModal from "./ConfirmationModal.tsx";
import Modal from "./Modal.tsx";
import InputField from "./InputField.tsx";
import Select from "./Select.tsx";
import Button from "./Button.tsx";

type RelationshipSelectorProps = {
	selectedRelationshipId?: string;
	domainRelationships: DomainRelationships;
	domainClasses: string[];
	onSelect?: (name: string) => void;
	onAdd?: (relationship: EditRelationshipForm) => void;
	onEdit?: (originalName: string, edited: EditRelationshipForm) => void;
	onDelete?: (relationship: Relationship) => void;
};

type RelationshipItemProps = {
	relationship: Relationship;
	selectedRelationshipId?: string;
	onSelect?: (name: string) => void;
	onStartEdit?: (relationship: Relationship) => void;
	onDelete?: (relationship: Relationship) => void;
};

function RelationshipItem({ relationship, selectedRelationshipId, onSelect, onDelete, onStartEdit }: RelationshipItemProps) {
	const isSelected = selectedRelationshipId === relationship.name;
	const [toBeDeletedRelationship, setToBeDeletedRelationship] = useState<Relationship | undefined>(undefined);

	function confirmDeleteRelationship(rel: Relationship) {
		setToBeDeletedRelationship(rel);
	}

	function deleteRelationship(rel: Relationship) {
		setToBeDeletedRelationship(undefined);
		onDelete?.(rel);
	}

	return (
		<div
			className={`flex items-center justify-between gap-2 px-1 py-0.5 cursor-pointer rounded select-none hover:bg-gray-100 ${
				isSelected ? "bg-accent-bg text-accent font-medium" : ""
			}`}
			onClick={() => onSelect?.(relationship.name)}
		>
			<span className="truncate">{relationship.name}</span>

			<div className="flex justify-end gap-2">
				<span className="text-gray-500 truncate text-[10px]">
					{relationship.subject.class} → {relationship.object.class}
				</span>

				{ isSelected &&
					<div className="flex items-center gap-2 pr-4">
						<FaPen className="text-orange-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); onStartEdit?.(relationship); }} />
						<FaTrash className="text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); confirmDeleteRelationship(relationship); }} />
					</div>
				}
			</div>

			<ConfirmationModal
				open={!!toBeDeletedRelationship}
				onCancel={() => setToBeDeletedRelationship(undefined)}
				onConfirm={() => deleteRelationship(toBeDeletedRelationship!)}
			>
				Are you sure you want to delete {toBeDeletedRelationship?.name}?
			</ConfirmationModal>
		</div>
	);
}

export default function ListRelationshipSelector({
	selectedRelationshipId,
	domainRelationships,
	domainClasses,
	onSelect,
	onAdd,
	onEdit,
	onDelete,
}: RelationshipSelectorProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRelationship, setEditingRelationship] = useState<Relationship | undefined>(undefined);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EditRelationshipForm>({
		resolver: zodResolver(editRelationshipSchema),
		defaultValues: { name: "", objectId: "", subjectId: "" },
		mode: "onBlur",
	});

	function startAddRelationship() {
		setEditingRelationship(undefined);
		reset({ name: "", objectId: "", subjectId: "" });
		setIsModalOpen(true);
	}

	function startEditRelationship(rel: Relationship) {
		setEditingRelationship(rel);
		reset({ name: rel.name, objectId: rel.object.class, subjectId: rel.subject.class });
		setIsModalOpen(true);
	}

	function closeModal() {
		setIsModalOpen(false);
		setEditingRelationship(undefined);
	}

	function onSubmit(data: EditRelationshipForm) {
		if (editingRelationship) {
			const changed =
				data.name !== editingRelationship.name ||
				data.subjectId !== editingRelationship.subject.class ||
				data.objectId !== editingRelationship.object.class;
			if (changed) onEdit?.(editingRelationship.name, data);
		} else {
			onAdd?.(data);
		}
		closeModal();
	}

	return (
		<div className="flex flex-col gap-2 text-xs border p-2 half-rounded">
			<div className="flex justify-between">
				<div className="text-gray-600">
					{domainRelationships.totalFound} relationships
				</div>

				{selectedRelationshipId ? (
					<div className="text-accent">{selectedRelationshipId}</div>
				) : (
					<div>Select a relationship</div>
				)}
			</div>

			<div className="flex flex-col max-h-100 overflow-y-auto">
				{domainRelationships.relationships.map((r) => (
					<RelationshipItem
						key={r.name}
						relationship={r}
						selectedRelationshipId={selectedRelationshipId}
						onSelect={onSelect}
						onStartEdit={startEditRelationship}
						onDelete={onDelete}
					/>
				))}
			</div>

			<div className="flex justify-end">
				<Button size="sm" onClick={startAddRelationship}>Aggiungi</Button>
			</div>

			<Modal width="32rem" open={isModalOpen} onClose={closeModal} title={editingRelationship ? "Edit relationship" : "Add relationship"}>
				<form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
					<InputField
						label="Name *"
						registration={register("name")}
						error={errors.name}
						size="md"
					/>

					<div className="flex flex-col gap-0.5">
						<label className="label text-lg!">Subject *</label>
						<Select
							options={domainClasses.map((c) => ({ label: c, value: c }))}
							placeholder="Select a subject class"
							registration={register("subjectId")}
							className="h-10"
							error={errors.subjectId}
						/>
					</div>

					<div className="flex flex-col gap-0.5">
						<label className="label text-lg!">Object *</label>
						<Select
							options={domainClasses.map((c) => ({ label: c, value: c }))}
							placeholder="Select an object class"
							registration={register("objectId")}
							className="h-10"
							error={errors.objectId}
						/>
					</div>

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
