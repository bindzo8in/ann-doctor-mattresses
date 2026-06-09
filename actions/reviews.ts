"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { auditLogger } from "@/lib/audit";

export async function createReview(productId: string, rating: number, title: string | null, comment: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if user has a DELIVERED order for this product
    const deliveredOrder = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          customerId: session.user.id,
          status: "DELIVERED",
        },
      },
    });

    if (!deliveredOrder) {
      throw new Error("You can only review products after successful delivery.");
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      throw new Error("You have already reviewed this product.");
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        isApproved: false, // Default to false
      },
    });

    await auditLogger.log({
      action: "CREATE",
      entityType: "Review",
      entityId: review.id,
      description: `User submitted a review for product ${productId}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: review,
    });

    revalidatePath(`/products/${productId}`); // Or correct slug path
    return { success: true, review };
  } catch (error: any) {
    console.error("createReview Error:", error);
    return { success: false, error: error.message || "Failed to create review" };
  }
}

export async function getApprovedReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error("getApprovedReviews Error:", error);
    return { success: false, error: "Failed to load reviews" };
  }
}

export async function canUserReviewProduct(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  try {
    const deliveredOrder = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          customerId: session.user.id,
          status: "DELIVERED",
        },
      },
    });

    if (!deliveredOrder) return false;

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: productId,
        userId: session.user.id,
      },
    });

    return !existingReview;
  } catch (error) {
    console.error("canUserReviewProduct Error:", error);
    return false;
  }
}

// ADMIN ACTIONS
export async function getAdminReviews() {
  const session = await auth();
  // Assume basic auth check, realistically should check role === 'SUPER_ADMIN'
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        product: {
          select: { name: true, slug: true, thumbnailUrl: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, reviews };
  } catch (error) {
    console.error("getAdminReviews Error:", error);
    return { success: false, error: "Failed to load reviews" };
  }
}

export async function toggleReviewApproval(reviewId: string, isApproved: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      include: { product: true }
    });

    await auditLogger.log({
      action: "UPDATE",
      entityType: "Review",
      entityId: reviewId,
      description: `Review approval status set to ${isApproved}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: updatedReview,
    });

    revalidatePath("/dashboard/reviews");
    if (updatedReview.product?.slug) {
        revalidatePath(`/product/${updatedReview.product.slug}`);
    }
    
    return { success: true, review: updatedReview };
  } catch (error) {
    console.error("toggleReviewApproval Error:", error);
    return { success: false, error: "Failed to update review status" };
  }
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const deletedReview = await prisma.review.delete({
      where: { id: reviewId },
      include: { product: true }
    });

    await auditLogger.log({
      action: "DELETE",
      entityType: "Review",
      entityId: reviewId,
      description: `Deleted review`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      oldValues: deletedReview,
    });

    revalidatePath("/dashboard/reviews");
    if (deletedReview.product?.slug) {
        revalidatePath(`/product/${deletedReview.product.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("deleteReview Error:", error);
    return { success: false, error: "Failed to delete review" };
  }
}
