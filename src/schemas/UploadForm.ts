import { z } from "zod";

export const uploadSchema = z.object({
    file: z.instanceof(FileList).refine((f) => f.length > 0, "File is required"),
    importOntology: z.boolean(),
    importInstances: z.boolean(),
});

export type UploadForm = z.infer<typeof uploadSchema>;
