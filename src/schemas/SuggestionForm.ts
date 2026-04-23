import { z } from "zod";

export const suggestionSchema = z.object({
    suggestion: z.string("Invalid suggestion").nonempty("Suggestion is required"),
});

export type SuggestionForm = z.infer<typeof suggestionSchema>;