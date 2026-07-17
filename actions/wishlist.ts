"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getUserWishlist() {
  const session = await auth();
  if (!session?.user?.id) {
    return { isAuthenticated: false, items: [] };
  }

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimals to Number
    const serializedItems = wishlistItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        variants: item.product.variants.map((v) => ({
          ...v,
          mrp: Number(v.mrp),
          salePrice: Number(v.salePrice),
        })),
      },
    }));

    return { isAuthenticated: true, items: serializedItems };
  } catch (error) {
    console.error("getUserWishlist Error:", error);
    return { isAuthenticated: true, items: [] };
  }
}
