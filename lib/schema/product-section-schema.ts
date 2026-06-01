import z from "zod";
import { featuresWithImageSectionSchema } from "./features-with-image-section-schema";
import { imageComparisonSectionSchema } from "./image-comparison-section-schema";
import { sleeperGuideSectionSchema } from "./sleeper-guide-section";

export const productSectionSchema = z.discriminatedUnion(
  "type",
  [
    z.object({
      type: z.literal("FEATURES_WITH_IMAGE"),

      title: z.string().min(1),

      sortOrder: z.number(),

      content: featuresWithImageSectionSchema,
    }),

    z.object({
      type: z.literal("IMAGE_COMPARISON"),

      title: z.string().optional(),

      sortOrder: z.number(),

      content: imageComparisonSectionSchema,
    }),

    z.object({
      type: z.literal("SLEEPER_GUIDE"),

      title: z.string().optional(),

      sortOrder: z.number(),

      content: sleeperGuideSectionSchema,
    }),

    z.object({
      type: z.literal("CUSTOM"),

      title: z.string().min(1),

      sortOrder: z.number(),

      content: z.any(),
    }),
  ]
);