import z from "zod";

export const ProductType = {
  MATTRESS: "MATTRESS",
  SOFA: "SOFA",
} as const;



export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const productSectionTypeSchema = z.enum([
  "FEATURES_WITH_IMAGE",
  "IMAGE_COMPARISON",
  "SLEEPER_GUIDE",
  "CUSTOM",
]);

export const MATTRESS_SIZE_NAMES = [
  "SINGLE",
  "DOUBLE",
  "QUEEN",
  "KING",
  "CUSTOM",
] as const;

