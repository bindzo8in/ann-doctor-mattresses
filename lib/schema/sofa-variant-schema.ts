import z from "zod";

export const sofaVariantSchema = z.object({
  variantType: z.literal("SOFA"),

  seatCount: z.number().int().positive(),
  material: z.string().min(1),
  // color: z.string().optional(),
  shape: z.string().optional(),

  sku: z.string().min(1),

  mrp: z.number().positive(),

  salePrice: z.number().positive(),

  isDefault: z.boolean(),
});
