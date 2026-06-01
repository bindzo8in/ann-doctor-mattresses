import { z } from "zod";

export const verifyEmailSchema = z.object({
  // email: z.email().trim(),
  token: z.string().trim().min(1, "Token is required"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;