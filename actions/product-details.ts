"use server";

import prisma from "@/lib/prisma";
import { ProductDetails, RelatedProduct } from "@/types/product-details";

export async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          include: {
            mattressVariant: true,
            sofaVariant: true,
          },
          orderBy: { salePrice: "asc" },
        },
        specifications: true,
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        faqs: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) return null;

    // Convert Decimals to numbers for client-side serialization
    return {
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        mrp: Number(v.mrp) as any,
        salePrice: Number(v.salePrice) as any,
      })),
    } as unknown as ProductDetails;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string
): Promise<RelatedProduct[]> {
  try {
    const related = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeProductId },
        isActive: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        variants: true,
      },
    });

    return related.map((p) => ({
      ...p,
      variants: p.variants.map((v) => ({
        ...v,
        mrp: Number(v.mrp) as any,
        salePrice: Number(v.salePrice) as any,
      })),
    })) as unknown as RelatedProduct[];
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}
