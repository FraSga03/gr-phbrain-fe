import type { DomainRelationships, Relationship } from "../types/Relationship.ts";

type RelationshipSelectorProps = {
	selectedRelationshipId?: string;
	domainRelationships: DomainRelationships;
	onSelect?: (name: string) => void;
};

type RelationshipItemProps = {
	relationship: Relationship;
	selectedRelationshipId?: string;
	onSelect?: (name: string) => void;
};

function RelationshipItem({ relationship, selectedRelationshipId, onSelect }: RelationshipItemProps) {
	const isSelected = selectedRelationshipId === relationship.name;

	return (
		<div
			className={`flex items-center justify-between gap-2 px-1 py-0.5 cursor-pointer rounded select-none hover:bg-gray-100 ${
				isSelected ? "bg-accent-bg text-accent font-medium" : ""
			}`}
			onClick={() => onSelect?.(relationship.name)}
		>
			<span className="truncate">{relationship.name}</span>
			<span className="text-gray-500 truncate text-[10px]">
				{relationship.subject.class} → {relationship.object.class}
			</span>
		</div>
	);
}

export default function ListRelationshipSelector({
	selectedRelationshipId,
	domainRelationships,
	onSelect,
}: RelationshipSelectorProps) {
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
					/>
				))}
			</div>
		</div>
	);
}
