import z from "zod";

export const firmnessEnum = z.enum([
  "SOFT",
  "MEDIUM_SOFT",
  "MEDIUM",
  "MEDIUM_FIRM",
  "FIRM",
]);

export const ageGroupEnum = z.enum(["KIDS", "TEEN", "ADULT", "SENIOR"]);

export const weightGroupEnum = z.enum([
  "UNDER_60",
  "KG_60_80",
  "KG_80_100",
  "OVER_100",
]);

export const sleepingPositionEnum = z.enum([
  "SIDE",
  "BACK",
  "STOMACH",
  "COMBINATION",
]);

export const comfortLevelEnum = z.enum(["PLUSH", "BALANCED", "SUPPORTIVE"]);

export const healthBenefitEnum = z.enum([
  "ORTHOPEDIC",
  "BACK_PAIN_RELIEF",
  "PRESSURE_RELIEF",
  "COOLING",
  "MOTION_ISOLATION",
]);

export const mattressVariantSchema = z
  .object({
    variantType: z.literal("MATTRESS"),

    sizeName: z.enum(["Single", "Double", "Queen", "King"]),

    width: z.number().int().positive(),

    length: z.number().int().positive(),

    thickness: z.number().int().positive(),

    firmness: firmnessEnum,

    // isOrthopedic: z.boolean(),

    recommendedAgeGroups: z.array(ageGroupEnum).nonempty("At least one age group must be selected"),

    recommendedWeightGroups: z.array(weightGroupEnum).nonempty("At least one weight group must be selected"),

    recommendedPositions: z.array(sleepingPositionEnum).nonempty("At least one sleeping position must be selected"),

    comfortLevel: comfortLevelEnum,

    healthBenefits: z.array(healthBenefitEnum).nonempty("At least one health benefit must be selected"),

    sku: z.string().nonempty(),

    mrp: z.number().positive(),

    salePrice: z.number().positive(),

    isDefault: z.boolean(),
  })
  .refine((data) => data.salePrice <= data.mrp, {
    message: "Sale price must be less than or equal to MRP",
    path: ["salePrice"],
  });
