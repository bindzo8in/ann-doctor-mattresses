import z from "zod";
import { imageSchema } from "./image-schema";

export const featuresWithImageSectionSchema = z.object({
  description: z.string().nonempty(),

  image: imageSchema.nullable(),

  features: z
    .array(
      z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
      }),
    )
    .nonempty("At least one feature is required"),
});
