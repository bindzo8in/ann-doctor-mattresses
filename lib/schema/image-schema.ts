import { z } from "zod";

export const imageSchema = z.object({
  url: z.url(),
  publicId: z.string().min(1),
});

export type Image = z.infer<typeof imageSchema>;