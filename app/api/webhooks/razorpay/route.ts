import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // We need raw text to verify the signature
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook Error: RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ message: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ message: "No signature provided" }, { status: 400 });
    }

    // Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook Error: Invalid Signature");
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Process the exact events requested
    switch (event.event) {
      case "order.paid":
      case "payment.captured": {
        // Both indicate successful payment
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

        // Find the matching payment in our DB
        const payments = await prisma.payment.findMany({
          where: { razorpayOrderId },
        });

        if (payments.length > 0) {
          const payment = payments[0];
          
          // Only update if it's currently pending or failed (don't overwrite already PAID if verified via frontend)
          if (payment.status !== PaymentStatus.PAID) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.PAID,
                razorpayPaymentId: razorpayPaymentId,
              },
            });

            // Update Order Status
            const order = await prisma.order.update({
              where: { id: payment.orderId },
              data: { status: OrderStatus.PAID },
            });

            // Empty cart if needed (optional here since frontend verify does it, but safe to do again)
            await prisma.cartItem.deleteMany({
              where: { userId: order.customerId },
            });
            console.log(`Webhook: Order ${order.orderNumber} successfully paid.`);
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;

        const payments = await prisma.payment.findMany({
          where: { razorpayOrderId },
        });

        if (payments.length > 0) {
          const payment = payments[0];
          if (payment.status !== PaymentStatus.PAID) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: PaymentStatus.FAILED },
            });
            console.log(`Webhook: Payment for Order ${payment.orderId} failed.`);
          }
        }
        break;
      }

      case "refund.processed": {
        const refundEntity = event.payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;

        const payments = await prisma.payment.findMany({
          where: { razorpayPaymentId },
        });

        if (payments.length > 0) {
          const payment = payments[0];
          
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.REFUNDED },
          });

          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: OrderStatus.REFUNDED },
          });
          console.log(`Webhook: Refund processed for Order ${payment.orderId}.`);
        }
        break;
      }

      case "refund.failed": {
        const refundEntity = event.payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;
        
        // Log the failure and optionally notify the admin
        console.error(`Webhook: Refund failed for payment ${razorpayPaymentId}. Check Razorpay Dashboard for details.`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
