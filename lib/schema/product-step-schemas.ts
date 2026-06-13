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
import { tagSchema } from "./product-form-schema";

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
export const basicInfoStepSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  type: z.enum(["MATTRESS", "SOFA"]),
  categoryId: z.string().nonempty("Please select a category"),
  shortDescription: z.array(tagSchema).nonempty("Add at least one short description"),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  availableColors: z.array(z.string()).optional(),
});

export type BasicInfoStepInput = z.infer<typeof basicInfoStepSchema>;

// ─── Step 2: Media ───────────────────────────────────────────────────────────
export const mediaStepSchema = z.object({
  thumbnail: imageSchema.nullable().optional(),
  images: z.array(productImageSchema),
});

export type MediaStepInput = z.infer<typeof mediaStepSchema>;

// ─── Step 3: Mattress Attributes ──────────────────────────────────────────────
export const attributesStepSchema = z.object({
  firmness: firmnessEnum.optional(),
  comfortLevel: comfortLevelEnum.optional(),
  healthBenefits: z.array(healthBenefitEnum).optional(),
  recommendedPositions: z.array(sleepingPositionEnum).optional(),
});

export type AttributesStepInput = z.infer<typeof attributesStepSchema>;

// ─── Step 4: Variants ────────────────────────────────────────────────────────
export const variantsStepSchema = z.object({
  variants: z.array(productVariantSchema),
  allowCustomSize: z.boolean().optional(),
  minWidth: z.coerce.number().min(1).nullable().optional(),
  maxWidth: z.coerce.number().min(1).nullable().optional(),
  minLength: z.coerce.number().min(1).nullable().optional(),
  maxLength: z.coerce.number().min(1).nullable().optional(),
  customSizePricing: z.any().optional(),
  customSizeMrpPricing: z.any().optional(),
}).superRefine((data, ctx) => {
  const defaultCount = data.variants.filter((v) => v.isDefault).length;
  if (data.variants.length > 0 && defaultCount !== 1) {
    ctx.addIssue({
      code: "custom",
      path: ["variants"],
      message: "Exactly one default variant is required",
    });
  }
});

export type VariantsStepInput = z.infer<typeof variantsStepSchema>;

// ─── Step 5: Specifications ───────────────────────────────────────────────────
export const specificationsStepSchema = z.object({
  specifications: z.array(productSpecificationSchema),
});

export type SpecificationsStepInput = z.infer<typeof specificationsStepSchema>;

// ─── Step 6: Sections ─────────────────────────────────────────────────────────
export const sectionsStepSchema = z.object({
  sectionsHeading: z.string().optional(),
  sections: z.array(productSectionSchema),
});

export type SectionsStepInput = z.infer<typeof sectionsStepSchema>;

// ─── Step 7: FAQs ────────────────────────────────────────────────────────────
export const faqsStepSchema = z.object({
  faqs: z.array(productFaqSchema),
});

export type FaqsStepInput = z.infer<typeof faqsStepSchema>;
