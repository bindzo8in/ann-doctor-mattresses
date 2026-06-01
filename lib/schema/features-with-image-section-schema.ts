import z from "zod";
import { imageSchema } from "./image-schema";

export const featuresWithImageSectionSchema = z.object({
  description: z.string().min(1),

  image: imageSchema.nullable(),

  features: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .min(1),
});
