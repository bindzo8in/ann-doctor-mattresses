import { Prisma } from "@/app/generated/prisma/client";
import { ProductFilterParams } from "./types";

export function buildProductWhereClause(filters: ProductFilterParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true, // Only show active products
  };

  if (filters.type) {
    where.type = filters.type;
  }

  // Build the variant filtering logic
  const variantConditions: Prisma.ProductVariantWhereInput = {};

  // Price Range
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    variantConditions.salePrice = {
      ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
      ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
    };
  }

  // Mattress Filters
  if (filters.type === "MATTRESS" || !filters.type) {
    const mattressConditions: Prisma.MattressVariantWhereInput = {};

    if (filters.size && filters.size.length > 0) {
      mattressConditions.sizeName = { in: filters.size };
    }
    if (filters.thickness && filters.thickness.length > 0) {
      mattressConditions.thickness = { in: filters.thickness };
    }

    if (Object.keys(mattressConditions).length > 0) {
      variantConditions.mattressVariant = mattressConditions;
    }
  }

  // Product-level Marketing Attributes
  if (filters.firmness && filters.firmness.length > 0) {
    where.firmness = { in: filters.firmness };
  }
  if (filters.comfortLevel && filters.comfortLevel.length > 0) {
    where.comfortLevel = { in: filters.comfortLevel };
  }
  if (filters.healthBenefits && filters.healthBenefits.length > 0) {
    where.healthBenefits = { hasSome: filters.healthBenefits };
  }
  if (filters.sleepingPosition && filters.sleepingPosition.length > 0) {
    where.recommendedPositions = { hasSome: filters.sleepingPosition };
  }
  if (filters.ageGroup && filters.ageGroup.length > 0) {
    where.recommendedAgeGroups = { hasSome: filters.ageGroup };
  }
  if (filters.weightGroup && filters.weightGroup.length > 0) {
    where.recommendedWeightGroups = { hasSome: filters.weightGroup };
  }

  // Sofa Filters
  if (filters.type === "SOFA" || !filters.type) {
    const sofaConditions: Prisma.SofaVariantWhereInput = {};

    if (filters.seatingCapacity && filters.seatingCapacity.length > 0) {
      sofaConditions.seatCount = { in: filters.seatingCapacity };
    }
    if (filters.material && filters.material.length > 0) {
      sofaConditions.material = { in: filters.material };
    }
    if (filters.shape && filters.shape.length > 0) {
      sofaConditions.shape = { in: filters.shape };
    }

    if (Object.keys(sofaConditions).length > 0) {
      variantConditions.sofaVariant = sofaConditions;
    }
  }

  if (Object.keys(variantConditions).length > 0) {
    where.variants = {
      some: variantConditions,
    };
  }

  return where;
}
