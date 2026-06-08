"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateCartTotals } from "@/lib/checkout";
import { auditLogger } from "@/lib/audit";

export async function getCheckoutTotals(params: {
  source: "CART" | "BUY_NOW";
  pincode?: string;
  buyNowItem?: {
    productId: string;
    variantId: string | null;
    quantity: number;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let itemsToCalculate: Array<{ productId: string; variantId: string | null; quantity: number }> = [];

  if (params.source === "BUY_NOW") {
    if (!params.buyNowItem) {
      throw new Error("Buy Now item details are missing");
    }
    itemsToCalculate = [params.buyNowItem];
  } else {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
    });
    itemsToCalculate = cartItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
  }

  if (itemsToCalculate.length === 0) {
    return {
      subTotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      totalAmount: 0,
      appliedPromotion: null,
      items: [],
    };
  }

  const calculation = await calculateCartTotals(itemsToCalculate, params.pincode);

  return {
    subTotal: calculation.subTotal,
    discountTotal: calculation.discountTotal,
    shippingTotal: calculation.shippingTotal,
    totalAmount: calculation.totalAmount,
    appliedPromotion: calculation.appliedPromotion,
    items: calculation.items,
  };
}

export async function cancelOrderAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.customerId !== session.user.id) {
    throw new Error("Order not found");
  }

  const cancellableStatuses = ["PENDING", "PENDING_PAYMENT", "PAID", "PENDING_ASSIGNMENT"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error("Only unassigned orders can be cancelled");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  await auditLogger.log({
    action: "ORDER_CANCELLED",
    entityType: "Order",
    entityId: order.id,
    description: `Order ${order.orderNumber} cancelled by customer`,
    newValues: { status: "CANCELLED" },
    actorUserId: session.user.id,
    actorRole: session.user.role,
  });

  return { success: true };
}
