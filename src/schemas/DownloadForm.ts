import { z } from "zod";

export const downloadSchema = z.object({
    fileName: z.string("Invalid file name").nonempty("File name is required"),
    format: z.enum(["gbs", "owl", "pl"]),
});

export type DownloadForm = z.infer<typeof downloadSchema>;
