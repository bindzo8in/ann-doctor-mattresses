"use server";

import prisma from "@/lib/prisma";
import { ProductFilterParams } from "@/lib/filters/types";
import { buildProductWhereClause } from "@/lib/filters/query-builder";

export async function getProducts(params: ProductFilterParams) {
  const { cursor, limit = 12 } = params;

  try {
    const where = buildProductWhereClause(params);

    const products = await prisma.product.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        variants: {
          include: {
            mattressVariant: true,
            sofaVariant: true,
          },
          orderBy: {
            salePrice: 'asc'
          }
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        specifications: true,
        reviews: { select: { rating: true } },
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem!.id;
    }

    // Transform products to convert Decimal to number for Client Components
    const serializedProducts = products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        mrp: Number(variant.mrp),
        salePrice: Number(variant.salePrice),
      }))
    }));

    return {
      products: serializedProducts,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}
