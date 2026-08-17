"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { auditLogger } from "@/lib/audit";
import { roundPrice } from "@/lib/price";
import { headers } from "next/headers";

async function checkAdmin(permission: "create" | "read" | "update" | "delete", target: string) {
  const hasPermission = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        [target]: [permission]
      }
    }
  })

  if (!hasPermission.success) {
    throw new Error("Unauthorized");
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
export async function getCustomerOrders(cursor: string | null = null, limit = 10) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
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

    // Convert decimal to number for client using decimal.js toNumber()
    const formattedOrders = orders.map((order) => ({
      ...order,
      subTotal: roundPrice(order.subTotal.toNumber()),
      discountTotal: roundPrice(order.discountTotal.toNumber()),
      shippingTotal: roundPrice(order.shippingTotal.toNumber()),
      totalAmount: roundPrice(order.totalAmount.toNumber()),
      payments: order.payments.map((p: any) => ({
        ...p,
        amount: roundPrice(p.amount.toNumber()),
        ...(p.refunds ? { refunds: p.refunds.map((r: any) => ({ ...r, amount: roundPrice(r.amount.toNumber()) })) } : {}),
      })),
      items: order.items.map((item) => ({
        ...item,
        price: roundPrice(item.price.toNumber()),
        unitPrice: roundPrice(item.unitPrice.toNumber()),
        totalPaid: roundPrice(item.totalPaid.toNumber()),
      })),
    }));

    return { orders: formattedOrders, nextCursor };
  } catch (error) {
    console.error("getCustomerOrders Error:", error);
    throw new Error("Failed to load orders");
  }
}

export async function getAdminOrders(cursor: string | null = null, limit = 10) {
  const session = await checkAdmin("read", "orders");
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    let whereClause = {};
    if (session!.user.role === "BRANCH_ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: session!.user.id } });
      if (!dbUser || !dbUser.branchId) {
        return { orders: [], nextCursor: undefined };
      }
      whereClause = { branchId: dbUser.branchId };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        payments: {
          include: { refunds: true }
        },
        items: true,
      }
    });

    let nextCursor: string | undefined = undefined;
    if (orders.length > limit) {
      const nextItem = orders.pop();
      nextCursor = nextItem!.id;
    }

    const formattedOrders = orders.map(order => ({
      ...order,
      subTotal: roundPrice(order.subTotal.toNumber()),
      discountTotal: roundPrice(order.discountTotal.toNumber()),
      shippingTotal: roundPrice(order.shippingTotal.toNumber()),
      totalAmount: roundPrice(order.totalAmount.toNumber()),
      payments: order.payments.map((p: any) => ({
        ...p,
        amount: roundPrice(p.amount.toNumber()),
        ...(p.refunds ? { refunds: p.refunds.map((r: any) => ({ ...r, amount: roundPrice(r.amount.toNumber()) })) } : {}),
      })),
      items: order.items.map((item: any) => ({
        ...item,
        price: roundPrice(item.price.toNumber()),
        unitPrice: roundPrice(item.unitPrice.toNumber()),
        totalPaid: roundPrice(item.totalPaid.toNumber()),
      }))
    }));

    return { orders: formattedOrders, nextCursor };
  } catch (error) {

    console.error("getAdminOrders Error:", error);
    throw new Error("Failed to load orders");
  }
}

export async function getOrderDetails(orderId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnailUrl: true,
              }
            },
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
      subTotal: roundPrice(order.subTotal.toNumber()),
      discountTotal: roundPrice(order.discountTotal.toNumber()),
      shippingTotal: roundPrice(order.shippingTotal.toNumber()),
      totalAmount: roundPrice(order.totalAmount.toNumber()),
      items: order.items.map((item) => ({
        ...item,
        price: roundPrice(item.price.toNumber()),
        quantityPurchased: item.quantityPurchased,
        quantityFree: item.quantityFree,
        unitPrice: roundPrice(item.unitPrice.toNumber()),
        totalPaid: roundPrice(item.totalPaid.toNumber()),
        offerType: item.offerType,
        saved: roundPrice(item.unitPrice.mul(item.quantityFree).toNumber()),
      })),
      payments: order.payments.map((p: any) => ({
        ...p,
        amount: roundPrice(p.amount.toNumber()),
        ...(p.refunds ? { refunds: p.refunds.map((r: any) => ({ ...r, amount: roundPrice(r.amount.toNumber()) })) } : {}),
      })),
    };
  } catch (error) {
    console.error("getOrderDetails Error:", error);
    throw new Error("Failed to load order details");
  }
}

export async function assignOrderToBranch(orderId: string, branchId: string | null) {
  const session = await checkAdmin("update", "orders");
  if (!session.user.id) {
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
          where: { branchId, role: "BRANCH_ADMIN" },
          select: { id: true }
        });

        const { NotificationService } = await import("@/lib/notification-service");
        const adminIds = branchAdmins.map(admin => admin.id);

        await NotificationService.notifyUsers(
          adminIds,
          "New Order Assigned",
          `Order #${order.orderNumber} has been assigned to your branch.`,
          "ORDER",
          "/dashboard/orders"
        );
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
      actorRole: session!.user.role!,
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("assignOrderToBranch Error:", error);
    throw new Error("Failed to assign order to branch");
  }
}

export async function initiateRazorpayRefund(orderId: string) {
  const session = await checkAdmin("update", "orders");
  if (!session.user.id) {
    throw new Error("Unauthorized: Insufficient permissions to initiate refunds");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: { include: { refunds: true } } }
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "CANCELLED") {
      throw new Error("Order must be cancelled before initiating a refund");
    }

    const paidPayment = order.payments.find((p) => (p.status === "PAID" || p.status === "REFUNDED" || p.status === "PENDING") && p.razorpayPaymentId);
    if (!paidPayment || !paidPayment.razorpayPaymentId) {
      throw new Error("No successful Razorpay payment found to refund");
    }

    // Check if an active/completed refund already exists
    const existingCompleted = paidPayment.refunds?.find((r) => r.status === "COMPLETED" || r.status === "INITIATED");
    if (existingCompleted) {
      throw new Error(`Refund has already been initiated for this payment (Refund ID: ${existingCompleted.razorpayRefundId || "N/A"})`);
    }

    const { env } = await import("@/env");
    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });

    // Initiate full refund via Razorpay API
    const refund = await razorpay.payments.refund(paidPayment.razorpayPaymentId, {
      amount: Math.round(paidPayment.amount.toNumber() * 100),
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      }
    });

    const isProcessed = refund.status === "processed";

    // Create Refund record
    const refundRecord = await prisma.refund.create({
      data: {
        paymentId: paidPayment.id,
        razorpayRefundId: refund.id,
        amount: paidPayment.amount,
        status: isProcessed ? "COMPLETED" : "INITIATED",
        processedAt: isProcessed ? new Date() : null,
        initiatedByUserId: session?.user?.id || null,
        reason: "Admin initiated refund",
      }
    });

    // Update payment status immediately so UI and reports reflect refund immediately
    await prisma.payment.update({
      where: { id: paidPayment.id },
      data: {
        status: "REFUNDED",
      },
    });

    await auditLogger.log({
      action: "REFUND_INITIATED",
      entityType: "Refund",
      entityId: refundRecord.id,
      description: `Refund initiated for payment ${paidPayment.id} (status: ${refund.status})`,
      metadata: { razorpayRefundId: refund.id, status: refund.status },
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role!,
    });

    return { 
      success: true, 
      refundId: refund.id,
      status: isProcessed ? "COMPLETED" : "INITIATED"
    };
  } catch (error: any) {
    console.error("initiateRazorpayRefund Error:", error);
    throw new Error(error.description || error.message || "Failed to initiate refund");
  }
}

export async function trackPublicOrder(params: { orderNumber: string; phoneOrEmail: string }) {
  const { orderNumber, phoneOrEmail } = params;

  if (!orderNumber || !phoneOrEmail) {
    throw new Error("Order number and contact information are required");
  }

  const cleanOrderNumber = orderNumber.trim();
  const cleanContact = phoneOrEmail.trim().toLowerCase();
  const cleanPhoneDigits = cleanContact.replace(/\D/g, "");

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: {
        equals: cleanOrderNumber,
        mode: "insensitive",
      },
    },
    include: {
      branch: { select: { name: true, city: true, phone: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
      },
      payments: {
        include: { refunds: true },
      },
    },
  });

  if (!order) {
    throw new Error("No order found with the provided Order Number.");
  }

  const shippingAddr = order.shippingAddress as Record<string, any> | null;
  const addressPhone = String(shippingAddr?.phone || "").replace(/\D/g, "");
  const addressEmail = String(shippingAddr?.email || "").toLowerCase().trim();

  const isPhoneMatch =
    cleanPhoneDigits.length >= 10 &&
    (addressPhone.endsWith(cleanPhoneDigits.slice(-10)) || cleanPhoneDigits.endsWith(addressPhone.slice(-10)));
  const isEmailMatch = cleanContact.includes("@") && addressEmail === cleanContact;

  if (!isPhoneMatch && !isEmailMatch) {
    throw new Error("The contact information does not match the order records.");
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    courierName: order.courierName,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    subTotal: roundPrice(order.subTotal.toNumber()),
    discountTotal: roundPrice(order.discountTotal.toNumber()),
    shippingTotal: roundPrice(order.shippingTotal.toNumber()),
    totalAmount: roundPrice(order.totalAmount.toNumber()),
    shippingAddress: order.shippingAddress,
    branch: order.branch,
    items: order.items.map((item) => ({
      ...item,
      price: roundPrice(item.price.toNumber()),
      quantityPurchased: item.quantityPurchased,
      quantityFree: item.quantityFree,
      unitPrice: roundPrice(item.unitPrice.toNumber()),
      totalPaid: roundPrice(item.totalPaid.toNumber()),
      offerType: item.offerType,
      saved: roundPrice(item.unitPrice.mul(item.quantityFree).toNumber()),
    })),
    payments: order.payments.map((p) => ({
      status: p.status,
      amount: roundPrice(p.amount.toNumber()),
      refunds: p.refunds?.map((r) => ({
        id: r.id,
        razorpayRefundId: r.razorpayRefundId,
        status: r.status,
        amount: roundPrice(r.amount.toNumber()),
      })),
    })),
  };
}
