import { z } from "zod";

export const newPropertySchema = z.object({
    propertyName: z.string("Invalid property name").nonempty("Property name is required"),
    type: z.enum(["string", "number", "date", "list"]),
    required: z.boolean(),
    unique: z.boolean(),
});

export type NewPropertyForm = z.infer<typeof newPropertySchema>;
