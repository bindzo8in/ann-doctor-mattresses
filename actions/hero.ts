"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";

function checkAdmin() {
  // Can be called by any admin role checking happens at route level, but we ensure here as well
  return auth().then(session => {
    if (!session?.user?.role || !["SUPER_ADMIN", "BRANCH_ADMIN"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
  });
}

export async function toggleHeroProduct(productId: string, isFeatured: boolean) {
  await checkAdmin();

  if (isFeatured) {
    const currentCount = await prisma.product.count({
      where: { isFeatured: true }
    });

    // Set it to feature and place at the end of the order
    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: true, featuredOrder: currentCount },
    });
  } else {
    // If unfeaturing, we just set isFeatured to false. 
    // The order doesn't matter, but next reorder will fix it.
    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: false, featuredOrder: 0 },
    });
  }

  return { success: true };
}

export async function reorderHeroProducts(orderedProductIds: string[]) {
  await checkAdmin();

  // Execute in a transaction to ensure all order updates are atomic
  await prisma.$transaction(
    orderedProductIds.map((id, index) =>
      prisma.product.update({
        where: { id },
        data: { featuredOrder: index },
      })
    )
  );

  return { success: true };
}
