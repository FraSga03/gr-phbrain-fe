export type RelationshipSelection = {
    classes: string[];
    instanceId: string | null;
};

export function buildRelationshipParams(
    currentSearch: string,
    subject: RelationshipSelection,
    object: RelationshipSelection
): string {
    const params = new URLSearchParams(currentSearch);

    // Set subject
    if (subject.classes.length > 0) {
        params.set("selectedSubjectClasses", subject.classes.join("-"));
    } else {
        params.delete("selectedSubjectClasses");
    }

    if (subject.instanceId) {
        params.set("subjectInstanceId", subject.instanceId);
    } else {
        params.delete("subjectInstanceId");
    }

    // Set object
    if (object.classes.length > 0) {
        params.set("selectedObjectClasses", object.classes.join("-"));
    } else {
        params.delete("selectedObjectClasses");
    }

    if (object.instanceId) {
        params.set("selectedObjectInstanceId", object.instanceId);
    } else {
        params.delete("selectedObjectInstanceId");
    }

    return params.toString();
}
