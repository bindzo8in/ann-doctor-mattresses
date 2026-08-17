import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { OrderStatus, PaymentStatus, CheckoutSource } from "@/app/generated/prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment details" }, { status: 400 });
    }

    const razorpayKeySecret = env.RAZORPAY_KEY_SECRET;

    // Verify signature
    const hmac = crypto.createHmac("sha256", razorpayKeySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature verification failed
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: PaymentStatus.FAILED }
      });
      return NextResponse.json({ message: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is successful
    const payments = await prisma.payment.findMany({
      where: { razorpayOrderId: razorpay_order_id },
    });
    
    if (payments.length === 0) {
      return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
    }

    const payment = payments[0];

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: PaymentStatus.PAID,
      }
    });

    // Update order status
    const order = await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PENDING_ASSIGNMENT },
    });

    // Send order confirmation email — fire-and-forget so checkout never fails because of email
    sendOrderConfirmationEmail(order.id).catch((error) => {
      console.error("[Checkout] Failed to send order confirmation email", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error,
      });
    });

    // Notify Admins
    try {
      const { NotificationService } = await import("@/lib/notification-service");
      await NotificationService.notifyAdmins(
        "New Order Received",
        `Order #${order.orderNumber} has been successfully paid and placed.`,
        "ORDER",
        "/dashboard/orders"
      );
    } catch (err) {
      console.error("Failed to trigger admin notification", err);
    }

    // Empty user's or guest's cart only if the order source is CART
    if (order.checkoutSource === CheckoutSource.CART) {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      const guestSessionId = req.cookies.get("guest_session_id")?.value;
      for (const item of orderItems) {
        if (order.customerId) {
          await prisma.cartItem.deleteMany({
            where: {
              userId: order.customerId,
              productId: item.productId,
              variantId: item.variantId,
            },
          });
        } else if (guestSessionId) {
          await prisma.cartItem.deleteMany({
            where: {
              sessionId: guestSessionId,
              productId: item.productId,
              variantId: item.variantId,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout Verify Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
