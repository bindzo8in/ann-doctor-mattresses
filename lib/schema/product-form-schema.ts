import { z } from "zod";

import { productSectionSchema } from "./product-section-schema";
import { productImageSchema } from "./product-image-schema";
import { faqSchema as productFaqSchema } from "./faq-schema";
import { specificationSchema as productSpecificationSchema } from "./specification-schema";
import { productVariantSchema } from "./product-variant-schema";
import { imageSchema } from "./image-schema";
import {
  firmnessEnum,
  comfortLevelEnum,
  healthBenefitEnum,
  sleepingPositionEnum,
} from "./mattress-variant-schema";

export const tagSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const createProductSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),

    slug: z.string().min(3, "Slug must be at least 3 characters long"),

    type: z.enum(["MATTRESS", "SOFA"]),

    shortDescription: z.array(tagSchema).nonempty("Add at least one short description"),

    // description: z.string().optional(),

    categoryId: z.string().nonempty("Please select a category"),

    thumbnail: imageSchema.refine(
      (data) => data.url !== null && data.publicId !== null,
      { message: "Thumbnail is required" }
    ),
    // thumbnailUrl: z.url(),

    // thumbnailPublicId: z.string(),

    isFeatured: z.boolean(),

    isActive: z.boolean(),

    images: z.array(productImageSchema).refine((data) => data.length > 0, "At least one image is required"),

    specifications: z.array(productSpecificationSchema),

    sectionsHeading: z.string().nonempty(),

    sections: z.array(productSectionSchema),

    faqs: z.array(productFaqSchema),

    firmness: firmnessEnum.optional(),
    comfortLevel: comfortLevelEnum.optional(),
    healthBenefits: z.array(healthBenefitEnum).optional(),
    recommendedPositions: z.array(sleepingPositionEnum).optional(),
    availableColors: z.array(z.string()).optional(),

    allowCustomSize: z.boolean().optional(),
    minWidth: z.coerce.number().min(1).nullable().optional(),
    maxWidth: z.coerce.number().min(1).nullable().optional(),
    minLength: z.coerce.number().min(1).nullable().optional(),
    maxLength: z.coerce.number().min(1).nullable().optional(),
    customSizePricing: z.any().optional(),
    customSizeMrpPricing: z.any().optional(),

    variants: z
      .array(productVariantSchema)
      .min(1, "At least one variant is required"),
  })
  .superRefine((data, ctx) => {

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

    if (data.type === "MATTRESS") {
      if (!data.firmness) {
        ctx.addIssue({ code: "custom", path: ["firmness"], message: "Firmness is required for mattresses" });
      }
      if (!data.comfortLevel) {
        ctx.addIssue({ code: "custom", path: ["comfortLevel"], message: "Comfort Level is required for mattresses" });
      }
      if (!data.healthBenefits || data.healthBenefits.length === 0) {
        ctx.addIssue({ code: "custom", path: ["healthBenefits"], message: "At least one health benefit must be selected" });
      }
      if (!data.recommendedPositions || data.recommendedPositions.length === 0) {
        ctx.addIssue({ code: "custom", path: ["recommendedPositions"], message: "At least one sleeping position must be selected" });
      }
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

    if (data.allowCustomSize) {
      if (data.minWidth !== null && data.minWidth !== undefined && data.minWidth <= 0) {
        ctx.addIssue({ code: "custom", path: ["minWidth"], message: "Width must be a positive number" });
      }
      if (data.maxWidth !== null && data.maxWidth !== undefined && data.maxWidth <= 0) {
        ctx.addIssue({ code: "custom", path: ["maxWidth"], message: "Width must be a positive number" });
      }
      if (data.minLength !== null && data.minLength !== undefined && data.minLength <= 0) {
        ctx.addIssue({ code: "custom", path: ["minLength"], message: "Length must be a positive number" });
      }
      if (data.maxLength !== null && data.maxLength !== undefined && data.maxLength <= 0) {
        ctx.addIssue({ code: "custom", path: ["maxLength"], message: "Length must be a positive number" });
      }

      if (data.minWidth && data.maxWidth && data.minWidth >= data.maxWidth) {
        ctx.addIssue({ code: "custom", path: ["minWidth"], message: "Min Width must be less than Max Width" });
      }
      if (data.minLength && data.maxLength && data.minLength >= data.maxLength) {
        ctx.addIssue({ code: "custom", path: ["minLength"], message: "Min Length must be less than Max Length" });
      }
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type ProductVariantInput = z.infer<typeof productVariantSchema>;