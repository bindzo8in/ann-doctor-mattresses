"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getCustomerOrders(cursor: string | null = null, limit = 10) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
        items: {
          include: {
            product: {
              select: { thumbnailUrl: true }
            }
          }
        }
      },
    });

    let nextCursor: string | null = null;
    if (orders.length > limit) {
      const nextItem = orders.pop();
      nextCursor = nextItem!.id;
    }

    // Convert decimal to number for client
    const formattedOrders = orders.map((order) => ({
      ...order,
      subTotal: Number(order.subTotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      totalAmount: Number(order.totalAmount),
      payments: order.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        unitPrice: Number(item.unitPrice),
        totalPaid: Number(item.totalPaid),
      })),
    }));

    return { orders: formattedOrders, nextCursor };
  } catch (error) {
    console.error("getCustomerOrders Error:", error);
    throw new Error("Failed to load orders");
  }
}

export async function getOrderDetails(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order || order.customerId !== session.user.id) {
      throw new Error("Order not found");
    }

    // Convert decimal to number for client
    return {
      ...order,
      subTotal: Number(order.subTotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        quantityPurchased: item.quantityPurchased,
        quantityFree: item.quantityFree,
        unitPrice: Number(item.unitPrice),
        totalPaid: Number(item.totalPaid),
        offerType: item.offerType,
        saved: item.quantityFree * Number(item.unitPrice),
      })),
      payments: order.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };
  } catch (error) {
    console.error("getOrderDetails Error:", error);
    throw new Error("Failed to load order details");
  }
}

