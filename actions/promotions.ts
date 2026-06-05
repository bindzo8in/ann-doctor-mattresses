"use server";

import prisma from "@/lib/prisma";

export async function getPromotionsSelectionData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return {
      products: products.map((p) => ({ label: p.name, value: p.id })),
      categories: categories.map((c) => ({ label: c.name, value: c.id })),
    };
  } catch (error) {
    console.error("Failed to get promotions selection data:", error);
    throw new Error("Failed to load select data");
  }
}
