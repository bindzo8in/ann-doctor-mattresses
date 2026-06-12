import { z } from "zod";

export const imageSchema = z.object({
  url: z.string(),
  publicId: z.string(),
});

export type Image = z.infer<typeof imageSchema>;