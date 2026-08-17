"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/checkout";
import { auditLogger } from "@/lib/audit";
import { cookies } from "next/headers";

export async function getCheckoutTotals(params: {
  source: "CART" | "BUY_NOW";
  pincode?: string;
  buyNowItem?: {
    productId: string;
    variantId: string | null;
    quantity: number;
    isCustom?: boolean;
    customData?: any;
  };
}) {
  const session = await auth();

  let itemsToCalculate: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
    isCustom?: boolean;
    customData?: any;
  }> = [];

  if (params.source === "BUY_NOW") {
    if (!params.buyNowItem) {
      throw new Error("Buy Now item details are missing");
    }
    itemsToCalculate = [params.buyNowItem];
  } else {
    if (session?.user?.id) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
      });
      itemsToCalculate = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        isCustom: item.isCustom,
        customData: item.customData,
      }));
    } else {
      const cookieStore = await cookies();
      const guestSessionId = cookieStore.get("guest_session_id")?.value;
      if (guestSessionId) {
        const cartItems = await prisma.cartItem.findMany({
          where: { sessionId: guestSessionId, userId: null },
        });
        itemsToCalculate = cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          isCustom: item.isCustom,
          customData: item.customData,
        }));
      }
    }
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

export async function cancelOrderAction(orderId: string, cancelReason?: string) {
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // If customer is registered, ensure it matches session
  if (order.customerId) {
    if (!session?.user?.id || order.customerId !== session.user.id) {
      throw new Error("Unauthorized");
    }
  } else {
    // For guest orders, allow cancellation only if still PENDING_PAYMENT
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error("Cannot cancel guest order that is already processed");
    }
  }

  const cancellableStatuses = ["PENDING", "PENDING_PAYMENT", "PAID", "PENDING_ASSIGNMENT"];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error("Only unassigned orders can be cancelled");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      ...(cancelReason && { cancelReason }),
    },
  });

  await auditLogger.log({
    action: "ORDER_CANCELLED",
    entityType: "Order",
    entityId: order.id,
    description: `Order ${order.orderNumber} cancelled${order.customerId ? " by customer" : " (guest)"}${cancelReason ? ` - Reason: ${cancelReason}` : ""}`,
    newValues: { status: "CANCELLED", cancelReason },
    actorUserId: session?.user?.id || undefined,
    actorRole: session?.user?.role ?? undefined,
  });

  return { success: true };
}
