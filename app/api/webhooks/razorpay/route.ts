import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus, RefundStatus } from "@/app/generated/prisma/client";
import { env } from "@/env";
import { auditLogger } from "@/lib/audit";
import { webhookRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    if (webhookRateLimit) {
      const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await webhookRateLimit.limit(ip);
      if (!success) {
        console.error(`Webhook Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json({ message: "Too many requests" }, { status: 429 });
      }
    }

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
              data: { status: OrderStatus.PENDING_ASSIGNMENT },
            });

            if (order.checkoutSource === "CART") {
              await prisma.cartItem.deleteMany({
                where: { userId: order.customerId },
              });
            }

            await auditLogger.log({
              action: "PAYMENT_CAPTURED",
              entityType: "Payment",
              entityId: payment.id,
              description: `Payment captured via Razorpay for order ${order.orderNumber}`,
              metadata: { razorpayPaymentId },
              actorRole: "SYSTEM",
            });

            console.log(`Webhook: Order ${order.orderNumber} successfully paid.`);
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;

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

            await auditLogger.log({
              action: "PAYMENT_FAILED",
              entityType: "Payment",
              entityId: payment.id,
              description: `Payment failed via Razorpay`,
              metadata: { razorpayPaymentId },
              actorRole: "SYSTEM",
            });

            console.log(`Webhook: Payment for Order ${payment.orderId} failed.`);
          }
        }
        break;
      }

      case "refund.processed": {
        const refundEntity = event.payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;
        const razorpayRefundId = refundEntity.id;
        const amountRefunded = refundEntity.amount / 100;

        let refundRecord = await prisma.refund.findUnique({
          where: { razorpayRefundId }
        });

        if (!refundRecord) {
          const payments = await prisma.payment.findMany({
            where: { razorpayPaymentId },
          });

          if (payments.length > 0) {
            refundRecord = await prisma.refund.create({
              data: {
                paymentId: payments[0].id,
                razorpayRefundId,
                amount: amountRefunded,
                status: RefundStatus.COMPLETED,
                processedAt: new Date(),
              }
            });
          }
        } else {
          refundRecord = await prisma.refund.update({
            where: { id: refundRecord.id },
            data: { status: RefundStatus.COMPLETED, processedAt: new Date() }
          });
        }

        if (refundRecord) {
          const allCompletedRefunds = await prisma.refund.findMany({
            where: { paymentId: refundRecord.paymentId, status: RefundStatus.COMPLETED }
          });
          const totalRefunded = allCompletedRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
          
          const payment = await prisma.payment.findUnique({ where: { id: refundRecord.paymentId } });
          if (payment) {
            const newStatus = totalRefunded >= Number(payment.amount) 
              ? PaymentStatus.REFUNDED 
              : PaymentStatus.PARTIALLY_REFUNDED;

            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: newStatus },
            });

            await auditLogger.log({
              action: "REFUND_PROCESSED",
              entityType: "Refund",
              entityId: refundRecord.id,
              description: `Refund processed successfully via Razorpay`,
              metadata: { razorpayRefundId, amountRefunded },
              actorRole: "SYSTEM",
            });
          }
          console.log(`Webhook: Refund processed for Refund ${razorpayRefundId}.`);
        }
        break;
      }

      case "refund.failed": {
        const refundEntity = event.payload.refund.entity;
        const razorpayRefundId = refundEntity.id;
        
        await prisma.refund.updateMany({
           where: { razorpayRefundId },
           data: {
             status: RefundStatus.FAILED,
             failedAt: new Date(),
           }
        });

        await auditLogger.log({
          action: "REFUND_FAILED",
          entityType: "Refund",
          description: `Refund failed via Razorpay`,
          metadata: { razorpayRefundId },
          actorRole: "SYSTEM",
        });

        console.error(`Webhook: Refund failed for refund ${razorpayRefundId}.`);
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
