import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.string().email().trim(),
  token: z.string().trim().length(6, "OTP must be 6 characters"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;