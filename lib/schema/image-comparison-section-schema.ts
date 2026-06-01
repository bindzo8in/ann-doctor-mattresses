import z from "zod";
import { imageSchema } from "./image-schema";

export const imageComparisonSectionSchema = z.object({
  items: z.array(
    z.object({
      label: z.string().min(1),

      image: imageSchema.nullable(),
    })
  ).length(2),
});