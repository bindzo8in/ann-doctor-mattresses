"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";

export async function getAdminPromotions(cursor: string | null = null, limit = 10) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  try {
    const promotions = await prisma.promotion.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined = undefined;
    if (promotions.length > limit) {
      const nextItem = promotions.pop();
      nextCursor = nextItem!.id;
    }

    return { promotions, nextCursor };
  } catch (error) {
    console.error("getAdminPromotions Error:", error);
    throw new Error("Failed to load promotions");
  }
}

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
