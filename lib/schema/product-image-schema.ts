// product-image.schema.ts

import { z } from "zod";
import { imageSchema } from "./image-schema";

export const productImageSchema = imageSchema.extend({
  sortOrder: z.number(),
});

export type ProductImage = z.infer<typeof productImageSchema>;