import z from "zod";
import { imageSchema } from "./image-schema";

export const imageComparisonSectionSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),

      image: imageSchema.nullable(),
    })
  ).length(2),
});