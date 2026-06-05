"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getCustomerOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
      },
    });

    // Convert decimal to number for client
    return orders.map((order) => ({
      ...order,
      subTotal: Number(order.subTotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      totalAmount: Number(order.totalAmount),
      payments: order.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    }));
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

