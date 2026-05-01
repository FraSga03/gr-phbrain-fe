import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z.string("Invalid password").nonempty("Current password is required"),
        newPassword: z
            .string("Invalid password")
            .nonempty("New password is required")
            .min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string("Invalid password").nonempty("Please confirm the new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
