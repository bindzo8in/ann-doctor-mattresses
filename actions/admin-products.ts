"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { MattressSize } from "@/app/generated/prisma/client";
import { auditLogger } from "@/lib/audit";
import { userHasPermission } from "@/lib/rbac";

export interface MatrixVariantInput {
  sizeName: MattressSize;
  width: number;
  length: number;
  thickness: number;
  mrp: number;
  salePrice: number;
}

export interface CustomSizeSettingsInput {
  allowCustomSize: boolean;
  minWidth?: number | null;
  maxWidth?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  customSizePricing?: any | null; // JSON object mapping thickness to price
}

export async function upsertProductMatrix(
  productId: string,
  matrixVariants: MatrixVariantInput[],
  customSettings: CustomSizeSettingsInput
) {
  const session = await auth();
  if (!userHasPermission(session?.user, "products.update")) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Update Product Custom Settings
    await prisma.product.update({
      where: { id: productId },
      data: {
        allowCustomSize: customSettings.allowCustomSize,
        minWidth: customSettings.minWidth,
        maxWidth: customSettings.maxWidth,
        minLength: customSettings.minLength,
        maxLength: customSettings.maxLength,
        customSizePricing: customSettings.customSizePricing || null,
      },
    });

    // 2. Fetch existing MattressVariants for this product
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId },
      include: { mattressVariant: true },
    });

    // We'll track which existing variants to keep/update
    const processedVariantIds = new Set<string>();

    // 3. Process the matrix
    // A single product variant is mapped 1:1 with MattressVariant here
    for (const [index, matrixVar] of matrixVariants.entries()) {
      // Find if we already have this exact dimension combo
      const existing = existingVariants.find(
        (v) =>
          v.mattressVariant?.sizeName === matrixVar.sizeName &&
          v.mattressVariant?.width === matrixVar.width &&
          v.mattressVariant?.length === matrixVar.length &&
          v.mattressVariant?.thickness === matrixVar.thickness
      );

      const isDefault = index === 0;

      if (existing) {
        // Update existing
        await prisma.productVariant.update({
          where: { id: existing.id },
          data: {
            mrp: matrixVar.mrp,
            salePrice: matrixVar.salePrice,
            isDefault,
          },
        });
        processedVariantIds.add(existing.id);
      } else {
        // Create new
        await prisma.productVariant.create({
          data: {
            productId,
            mrp: matrixVar.mrp,
            salePrice: matrixVar.salePrice,
            isDefault,
            mattressVariant: {
              create: {
                sizeName: matrixVar.sizeName,
                width: matrixVar.width,
                length: matrixVar.length,
                thickness: matrixVar.thickness,
              },
            },
          },
        });
      }
    }

    // 4. Delete variants that were NOT in the new matrix
    const variantsToDelete = existingVariants
      .filter((v) => !processedVariantIds.has(v.id) && v.mattressVariant !== null)
      .map((v) => v.id);

    if (variantsToDelete.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { id: { in: variantsToDelete } },
      });
    }

    await auditLogger.log({
      action: "PRODUCT_MATRIX_UPDATED",
      entityType: "Product",
      entityId: productId,
      description: `Product matrix and custom settings updated for product ${productId}`,
      actorUserId: session!.user.id,
      actorRole: session!.user.role,
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/products`);
    // revalidate exact product page slug later if needed

    return { success: true };
  } catch (error: any) {
    console.error("upsertProductMatrix Error:", error);
    return { success: false, error: error.message || "Failed to update matrix" };
  }
}
