import { z } from "zod";

export const extractGraphSchema = z.object({
    file: z.instanceof(FileList).refine((f) => f.length > 0, "File is required"),
    prefix: z.string("Invalid prefix").nonempty("Prefix is required"),
    nodeId: z.string("Invalid node id").nonempty("Node ID is required"),
    distance: z.number("Invalid distance").min(1, "Distance must be at least 1"),
    outputFile: z.string("Invalid output file").nonempty("Output file is required"),
});

export type ExtractGraphForm = z.infer<typeof extractGraphSchema>;
