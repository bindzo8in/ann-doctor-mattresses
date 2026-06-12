// product-image.schema.ts

import { z } from "zod";
import { imageSchema } from "./image-schema";

export const productImageSchema = imageSchema.extend({
  id: z.string().optional(),
  sortOrder: z.number(),
});

export type ProductImage = z.infer<typeof productImageSchema>;