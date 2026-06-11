import { Prisma } from "@/app/generated/prisma/client";
import { ProductFilterParams } from "./types";

export function buildProductWhereClause(filters: ProductFilterParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true, // Only show active products
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category && filters.category.length > 0) {
    where.category = { slug: { in: filters.category } };
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

  const hasSizeFilter = filters.size && filters.size.length > 0;
  const hasCustomSize = filters.size?.includes("CUSTOM");

  // Mattress Filters
  const isMattress = filters.type === "MATTRESS" || !filters.type;
  if (isMattress) {
    const baseMattressConditions: Prisma.MattressVariantWhereInput = {};

    if (filters.thickness && filters.thickness.length > 0) {
      baseMattressConditions.thickness = { in: filters.thickness };
    }

    if (Object.keys(baseMattressConditions).length > 0) {
      variantConditions.mattressVariant = baseMattressConditions;
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

  // Apply Variant Conditions
  if (hasSizeFilter && isMattress) {
    const orConditions: Prisma.ProductWhereInput[] = [];

    // Condition 1: Has a variant that matches the requested exact sizes
    const exactSizeVariantConditions: Prisma.ProductVariantWhereInput = {
      ...variantConditions,
      mattressVariant: {
        ...(variantConditions.mattressVariant as Prisma.MattressVariantWhereInput || {}),
        sizeName: { in: filters.size },
      }
    };
    orConditions.push({
      variants: { some: exactSizeVariantConditions }
    });

    // Condition 2: If CUSTOM is requested, match products with allowCustomSize=true
    if (hasCustomSize) {
      orConditions.push({
        allowCustomSize: true,
        ...(Object.keys(variantConditions).length > 0 ? { variants: { some: variantConditions } } : {})
      });
    }

    where.OR = orConditions;
  } else {
    // No size filter, just apply base variant conditions
    if (Object.keys(variantConditions).length > 0) {
      where.variants = {
        some: variantConditions,
      };
    }
  }

  return where;
}
