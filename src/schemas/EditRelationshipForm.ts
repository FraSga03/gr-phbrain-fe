import { z } from "zod";

export const editRelationshipSchema = z.object({
    name: z.string("Invalid name").nonempty("Name is required"),
    subjectId: z.string("Invalid subject").nonempty("Subject is required"),
    objectId: z.string("Invalid object").nonempty("Object is required"),
});

export type EditRelationshipForm = z.infer<typeof editRelationshipSchema>;
