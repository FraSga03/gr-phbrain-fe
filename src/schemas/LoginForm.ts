import { z } from "zod";

export const loginSchema = z.object({
    username: z.string("Invalid username").nonempty("Username is required"),
    password: z.string("Invalid password").nonempty("Password is required"),
});

export type LoginForm = z.infer<typeof loginSchema>;