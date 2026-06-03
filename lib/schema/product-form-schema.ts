import { z } from "zod";

import { productSectionSchema } from "./product-section-schema";
import { productImageSchema } from "./product-image-schema";
import { faqSchema as productFaqSchema } from "./faq-schema";
import { specificationSchema as productSpecificationSchema } from "./specification-schema";
import { productVariantSchema } from "./product-variant-schema";
import { imageSchema } from "./image-schema";

export const tagSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const createProductSchema = z
  .object({
    name: z.string().min(3),

    slug: z.string().min(3),

    type: z.enum(["MATTRESS", "SOFA"]),

    shortDescription: z.array(tagSchema),

    // description: z.string().optional(),

    categoryId: z.string().nonempty(),

    thumbnail: imageSchema.nullable(),
    // thumbnailUrl: z.url(),

    // thumbnailPublicId: z.string(),

    isFeatured: z.boolean(),

    isActive: z.boolean(),

    images: z.array(productImageSchema),

    specifications: z.array(productSpecificationSchema),

    sectionsHeading: z.string().nonempty(),

    sections: z.array(productSectionSchema),

    faqs: z.array(productFaqSchema),

    variants: z
      .array(productVariantSchema)
      .min(1, "At least one variant is required"),
  })
  .superRefine((data, ctx) => {
    if (data.thumbnail?.url === null || data.thumbnail?.publicId === null) {
      ctx.addIssue({
        code: "custom",
        path: ["thumbnail"],
        message: "Thumbnail is required",
      });
    }
    if (
      data.type === "MATTRESS" &&
      data.variants.some((v) => v.variantType !== "MATTRESS")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Only mattress variants are allowed",
      });
    }

    if (
      data.type === "SOFA" &&
      data.variants.some((v) => v.variantType !== "SOFA")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Only sofa variants are allowed",
      });
    }

    // if (data.variants.length === 0) {
    //   ctx.addIssue({
    //     code: "custom",
    //     path: ["variants"],
    //     message: "At least one variant is required",
    //   });
    // }

    const defaultCount = data.variants.filter((v) => v.isDefault).length;

    if (defaultCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Exactly one default variant is required",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type ProductVariantInput = z.infer<typeof productVariantSchema>;