import { z } from "zod";

export const editClassSchema = z.object({
    name: z.string("Invalid name").nonempty("Name is required"),
    parent: z.string().optional(),
});

export type EditClassForm = z.infer<typeof editClassSchema>;
