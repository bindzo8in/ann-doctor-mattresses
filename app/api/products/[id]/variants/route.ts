import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { variantsStepSchema } from "@/lib/schema/product-step-schemas";
import { getFieldErrors } from "@/lib/utils";

interface RouteProps {
  params: Promise<{ id: string }>;
}

import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.update")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = variantsStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: getFieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ── Fetch existing variants from DB ───────────────────────────────────────
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: {
        id: true,
        mrp: true,
        salePrice: true,
        isDefault: true,
        mattressVariant: {
          select: { sizeName: true, width: true, length: true, thickness: true },
        },
        sofaVariant: {
          select: { seatCount: true, material: true, shape: true },
        },
      },
    });

    const existingMap = new Map(existingVariants.map((v) => [v.id, v]));
    const incomingIds = new Set(
      data.variants.map((v: any) => v.id).filter(Boolean)
    );

    // ── Phase 1: DELETE removed variants ─────────────────────────────────────
    const toDelete = existingVariants
      .filter((v) => !incomingIds.has(v.id))
      .map((v) => v.id);

    if (toDelete.length > 0) {
      await prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } });
    }

    // ── Phase 2: UPDATE existing variants (only changed fields) ──────────────
    const toUpdate = data.variants.filter(
      (v: any) => v.id && existingMap.has(v.id)
    );

    const updatePromises: Promise<any>[] = [];

    toUpdate.forEach((incoming: any) => {
      const old = existingMap.get(incoming.id)!;

      const mrpChanged = old.mrp.toNumber() !== incoming.mrp;
      const salePriceChanged = old.salePrice.toNumber() !== incoming.salePrice;
      const defaultChanged = old.isDefault !== incoming.isDefault;

      if (mrpChanged || salePriceChanged || defaultChanged) {
        updatePromises.push(
          prisma.productVariant.update({
            where: { id: incoming.id },
            data: {
              mrp: incoming.mrp,
              salePrice: incoming.salePrice,
              isDefault: incoming.isDefault,
            },
          })
        );
      }

      if (incoming.variantType === "MATTRESS" && old.mattressVariant) {
        const mv = old.mattressVariant;
        if (
          mv.sizeName !== incoming.sizeName ||
          mv.width !== incoming.width ||
          mv.length !== incoming.length ||
          mv.thickness !== incoming.thickness
        ) {
          updatePromises.push(
            prisma.mattressVariant.update({
              where: { variantId: incoming.id },
              data: {
                sizeName: incoming.sizeName,
                width: incoming.width,
                length: incoming.length,
                thickness: incoming.thickness,
              },
            })
          );
        }
      }

      if (incoming.variantType === "SOFA" && old.sofaVariant) {
        const sv = old.sofaVariant;
        if (
          sv.seatCount !== incoming.seatCount ||
          sv.material !== incoming.material ||
          sv.shape !== incoming.shape
        ) {
          updatePromises.push(
            prisma.sofaVariant.update({
              where: { variantId: incoming.id },
              data: {
                seatCount: incoming.seatCount,
                material: incoming.material,
                shape: incoming.shape,
              },
            })
          );
        }
      }
    });

    // Also update product-level pricing meta in parallel with variant updates
    updatePromises.push(
      prisma.product.update({
        where: { id },
        data: {
          allowCustomSize: data.allowCustomSize ?? false,
          minWidth: data.minWidth ?? null,
          maxWidth: data.maxWidth ?? null,
          minLength: data.minLength ?? null,
          maxLength: data.maxLength ?? null,
          customSizePricing: data.customSizePricing ?? null,
        },
      })
    );

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // ── Phase 3: CREATE new variants in parallel ──────────────────────────────
    // Running concurrently cuts 91 sequential inserts (~30s) to ~1–2s
    const toCreate = data.variants.filter(
      (v: any) => !v.id || !existingMap.has(v.id)
    );

    if (toCreate.length > 0) {
      await Promise.all(
        toCreate.map((incoming: any) =>
          prisma.productVariant.create({
            data: {
              productId: id,
              mrp: incoming.mrp,
              salePrice: incoming.salePrice,
              isDefault: incoming.isDefault,
              ...(incoming.variantType === "MATTRESS"
                ? {
                    mattressVariant: {
                      create: {
                        sizeName: incoming.sizeName,
                        width: incoming.width,
                        length: incoming.length,
                        thickness: incoming.thickness,
                      },
                    },
                  }
                : {
                    sofaVariant: {
                      create: {
                        seatCount: incoming.seatCount,
                        material: incoming.material,
                        shape: incoming.shape ?? null,
                      },
                    },
                  }),
            },
          })
        )
      );
    }

    // ── Return fresh variants with DB ids for form to sync ────────────────────
    const savedVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: {
        id: true,
        mrp: true,
        salePrice: true,
        isDefault: true,
        mattressVariant: {
          select: { sizeName: true, width: true, length: true, thickness: true },
        },
        sofaVariant: {
          select: { seatCount: true, material: true, shape: true },
        },
      },
    });

    // Serialize Decimal → number before JSON response
    const serialized = savedVariants.map((v) => {
      if (v.mattressVariant) {
        return {
          id: v.id,
          variantType: "MATTRESS" as const,
          mrp: v.mrp.toNumber(),
          salePrice: v.salePrice.toNumber(),
          isDefault: v.isDefault,
          sizeName: v.mattressVariant.sizeName,
          width: v.mattressVariant.width,
          length: v.mattressVariant.length,
          thickness: v.mattressVariant.thickness,
        };
      }
      return {
        id: v.id,
        variantType: "SOFA" as const,
        mrp: v.mrp.toNumber(),
        salePrice: v.salePrice.toNumber(),
        isDefault: v.isDefault,
        seatCount: v.sofaVariant!.seatCount,
        material: v.sofaVariant!.material,
        shape: v.sofaVariant!.shape,
      };
    });

    return NextResponse.json({ success: true, data: { variants: serialized } });
  } catch (error: any) {
    console.error("PATCH variants error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save variants" },
      { status: 500 }
    );
  }
}
