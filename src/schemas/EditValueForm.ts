import { z } from "zod";

export const editValueSchema = z.object({
    value: z.string("Invalid value").nonempty("Value is required"),
});

export type EditValueForm = z.infer<typeof editValueSchema>;
