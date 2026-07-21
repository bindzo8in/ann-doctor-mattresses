import type { CreateProductInput } from "@/lib/schema/product-form-schema";

type StepApiResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; message: string; errors?: Record<string, { message: string }> };

// ─── Helper ───────────────────────────────────────────────────────────────────

async function patchStep<T>(
  productId: string,
  step: string,
  body: unknown
): Promise<StepApiResult<T>> {
  try {
    const res = await fetch(`/api/products/${productId}/${step}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Failed to save ${step}`,
        errors: data.errors,
      };
    }

    return { success: true, data: data.data ?? data };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : `Failed to save ${step}`,
    };
  }
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

export async function saveBasicInfo(
  productId: string,
  values: Pick<
    CreateProductInput,
    "name" | "slug" | "type" | "categoryId" | "shortDescription" | "isFeatured" | "isActive" | "availableColors" | "defaultColor"
  >
): Promise<StepApiResult<{ id: string }>> {
  return patchStep(productId, "basic-info", values);
}

// ─── Step 1 Create (POST) ─────────────────────────────────────────────────────

export async function createProduct(
  values: Pick<
    CreateProductInput,
    "name" | "slug" | "type" | "categoryId" | "shortDescription" | "isFeatured" | "isActive" | "availableColors" | "defaultColor"
  >
): Promise<StepApiResult<{ id: string }>> {
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to create product",
        errors: data.errors,
      };
    }

    return { success: true, data: data.data };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create product",
    };
  }
}

// ─── Step 2: Media ───────────────────────────────────────────────────────────

export type SavedMedia = {
  thumbnail: { url: string; publicId: string } | null;
  images: { id: string; url: string; publicId: string; sortOrder: number }[];
};

export async function saveMedia(
  productId: string,
  values: Pick<CreateProductInput, "thumbnail" | "images">
): Promise<StepApiResult<SavedMedia>> {
  return patchStep(productId, "media", values);
}

// ─── Step 3: Attributes ──────────────────────────────────────────────────────

export async function saveAttributes(
  productId: string,
  values: Pick<
    CreateProductInput,
    "firmness" | "comfortLevel" | "healthBenefits" | "recommendedPositions"
  >
): Promise<StepApiResult<void>> {
  return patchStep(productId, "attributes", values);
}

// ─── Step 4: Variants ────────────────────────────────────────────────────────

export type SavedVariant = {
  id: string;
  mrp: number;
  salePrice: number;
  isDefault: boolean;
  variantType: "MATTRESS" | "SOFA";
  // Mattress specific
  sizeName?: string;
  width?: number;
  length?: number;
  thickness?: number;
  // Sofa specific
  seatCount?: number;
  material?: string;
  shape?: string;
};

export async function saveVariants(
  productId: string,
  values: Pick<
    CreateProductInput,
    | "variants"
    | "allowCustomSize"
    | "minWidth"
    | "maxWidth"
    | "minLength"
    | "maxLength"
    | "customSizePricing"
    | "customSizeMrpPricing"
    | "baseMrpPerSqFtPerInch"
    | "baseSalePricePerSqFtPerInch"
  >
): Promise<StepApiResult<{ variants: SavedVariant[] }>> {
  return patchStep(productId, "variants", values);
}

// ─── Step 5: Specifications ──────────────────────────────────────────────────

export type SavedSpecification = { id: string; label: string; value: string };

export async function saveSpecifications(
  productId: string,
  values: Pick<CreateProductInput, "specifications">
): Promise<StepApiResult<{ specifications: SavedSpecification[] }>> {
  return patchStep(productId, "specifications", values);
}

// ─── Step 6: Sections ────────────────────────────────────────────────────────

export type SavedSection = { id: string; type: string; sortOrder: number; content: unknown };

export async function saveSections(
  productId: string,
  values: Pick<CreateProductInput, "sections" | "sectionsHeading">
): Promise<StepApiResult<{ sections: SavedSection[] }>> {
  return patchStep(productId, "sections", values);
}

// ─── Step 7: FAQs ────────────────────────────────────────────────────────────

export type SavedFaq = { id: string; question: string; answer: string; sortOrder: number };

export async function saveFaqs(
  productId: string,
  values: Pick<CreateProductInput, "faqs">
): Promise<StepApiResult<{ faqs: SavedFaq[] }>> {
  return patchStep(productId, "faqs", values);
}
