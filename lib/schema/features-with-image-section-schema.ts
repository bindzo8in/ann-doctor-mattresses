import z from "zod";
import { imageSchema } from "./image-schema";

export const featuresWithImageSectionSchema = z.object({
  description: z.string(),

  image: imageSchema.nullable(),

  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
});
