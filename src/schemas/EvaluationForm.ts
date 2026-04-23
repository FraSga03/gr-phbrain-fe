import { z } from "zod";

export const evaluationSchema = z.object({
    property: z.string("Invalid property").nonempty("Property is required"),
    evaluation: z.string("Invalid evaluation"),
});

export type EvaluationForm = z.infer<typeof evaluationSchema>;

export type EvaluationCreateDTO = EvaluationForm & { type: "comment" | "approve" | "reject" };