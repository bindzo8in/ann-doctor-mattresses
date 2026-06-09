"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { auditLogger } from "@/lib/audit";
import { userHasPermission } from "@/lib/rbac";

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
        payments: {
          include: { refunds: true }
        },
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
      payments: order.payments.map((p: any) => ({
        ...p,
        amount: Number(p.amount),
        ...(p.refunds ? { refunds: p.refunds.map((r: any) => ({ ...r, amount: Number(r.amount) })) } : {}),
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
        payments: {
          include: { refunds: true }
        },
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
      payments: order.payments.map((p: any) => ({
        ...p,
        amount: Number(p.amount),
        ...(p.refunds ? { refunds: p.refunds.map((r: any) => ({ ...r, amount: Number(r.amount) })) } : {}),
      })),
    };
  } catch (error) {
    console.error("getOrderDetails Error:", error);
    throw new Error("Failed to load order details");
  }
}

export async function assignOrderToBranch(orderId: string, branchId: string | null) {
  const session = await auth();
  if (!userHasPermission(session?.user, "orders.update")) {
    throw new Error("Unauthorized: Insufficient permissions to assign branches");
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { branchId },
      select: { id: true, orderNumber: true }
    });

    if (branchId) {
      try {
        const branchAdmins = await prisma.user.findMany({
          where: { branchId, role: "BRANCH_ADMIN", isActive: true },
          select: { id: true }
        });

        const { NotificationService } = await import("@/lib/notification-service");
        for (const admin of branchAdmins) {
          await NotificationService.notifyUser(
            admin.id,
            "New Order Assigned",
            `Order #${order.orderNumber} has been assigned to your branch.`,
            "ORDER",
            "/dashboard/orders"
          );
        }
      } catch (err) {
        console.error("Failed to notify branch admin:", err);
      }
    }

    await auditLogger.log({
      action: "ORDER_ASSIGNED",
      entityType: "Order",
      entityId: order.id,
      description: `Order ${order.orderNumber} assigned to branch ${branchId}`,
      newValues: { branchId },
      actorUserId: session!.user.id,
      actorRole: session!.user.role,
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("assignOrderToBranch Error:", error);
    throw new Error("Failed to assign order to branch");
  }
}

export async function initiateRazorpayRefund(orderId: string) {
  const session = await auth();
  if (!userHasPermission(session?.user, "orders.refund")) {
    throw new Error("Unauthorized: Insufficient permissions to initiate refunds");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "CANCELLED") {
      throw new Error("Order must be cancelled before initiating a refund");
    }

    const paidPayment = order.payments.find((p) => p.status === "PAID" && p.razorpayPaymentId);
    if (!paidPayment || !paidPayment.razorpayPaymentId) {
      throw new Error("No successful Razorpay payment found to refund");
    }

    const { env } = await import("@/env");
    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });

    // Initiate full refund
    const refund = await razorpay.payments.refund(paidPayment.razorpayPaymentId, {
      amount: Math.round(Number(paidPayment.amount) * 100),
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      }
    });

    const session = await auth();

    // Create Refund record (Webhook will handle Payment status update)
    const refundRecord = await prisma.refund.create({
      data: {
        paymentId: paidPayment.id,
        razorpayRefundId: refund.id,
        amount: paidPayment.amount,
        status: "INITIATED",
        initiatedByUserId: session?.user?.id || null,
        reason: "Admin initiated refund",
      }
    });

    await auditLogger.log({
      action: "REFUND_INITIATED",
      entityType: "Refund",
      entityId: refundRecord.id,
      description: `Refund initiated for payment ${paidPayment.id}`,
      metadata: { razorpayRefundId: refund.id },
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role,
    });

    return { success: true, refundId: refund.id };
  } catch (error: any) {
    console.error("initiateRazorpayRefund Error:", error);
    throw new Error(error.description || error.message || "Failed to initiate refund");
  }
}
