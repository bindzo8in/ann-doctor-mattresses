import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.string().email().trim(),
  token: z.string().trim().length(6, "OTP must be 6 characters"),
  password: z.string().min(8),
});