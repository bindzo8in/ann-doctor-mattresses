import { z } from "zod";

export const imageSchema = z.object({
  url: z.url().nonempty(),
  publicId: z.string().nonempty(),
});

export type Image = z.infer<typeof imageSchema>;