import z from "zod";

export const mattressVariantSchema = z.object({
  variantType: z.literal("MATTRESS"),
  sizeName: z.enum([
    "Single",
    "Double",
    "Queen",
    "King"
  ]),

  width: z.number().int().positive(),
  length: z.number().int().positive(),
  thickness: z.number().int().positive(),

  sku: z.string().nonempty(),

  mrp: z.number().positive(),

  salesPrice: z.number().positive(),

  isDefault: z.boolean(),
});
