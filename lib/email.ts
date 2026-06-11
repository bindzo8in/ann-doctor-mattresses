/**
 * lib/email.ts — Production Email Utility V2
 *
 * - Single shared Resend instance (instantiated once at module load)
 * - Server-side env vars only (EMAIL_FROM, not NEXT_PUBLIC_*)
 * - Structured error logging with recipient + subject context
 * - Lightweight EmailLog persistence for debugging
 * - Throws on failure — callers decide how to handle (fire-and-forget vs awaited)
 */

import { Resend } from "resend";
import * as React from "react";
import prisma from "@/lib/prisma";
import { env } from "@/env";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import DeliveryStatusEmail from "@/emails/DeliveryStatusEmail";

// ---------------------------------------------------------------------------
// Shared Resend client — instantiated once, reused across all requests
// ---------------------------------------------------------------------------

const resend = new Resend(env.RESEND_API_KEY);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendEmailParams {
  to: string;
  subject: string;
  /** Mutually exclusive with `react`. Raw HTML email body. */
  html?: string;
  /** Mutually exclusive with `html`. React Email component. */
  react?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Persist an email attempt to the EmailLog table.
 * Non-blocking — never throws; failure here is only logged to console.
 */
async function logEmail(
  recipient: string,
  subject: string,
  status: "SENT" | "FAILED",
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: { recipient, subject, status, errorMessage },
    });
  } catch (err) {
    console.error("[EmailLog] Failed to persist email log:", err);
  }
}

// ---------------------------------------------------------------------------
// Core send utility
// ---------------------------------------------------------------------------

/**
 * Send a transactional email via Resend.
 *
 * Throws if Resend returns an error so the caller can decide how to handle it.
 * Logs every attempt (success + failure) to the EmailLog table.
 */
export async function sendEmail({ to, subject, html, react }: SendEmailParams): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      ...(react ? { react } : { html: html ?? "" }),
    });

    if (error) {
      const message = error.message ?? "Unknown Resend error";
      console.error("[Email] Resend returned error:", { to, subject, error });
      await logEmail(to, subject, "FAILED", message);
      throw new Error(`Email send failed: ${message}`);
    }

    await logEmail(to, subject, "SENT");
  } catch (err) {
    // Only log here if it wasn't already logged above (i.e. non-Resend errors)
    if (!(err instanceof Error && err.message.startsWith("Email send failed:"))) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email] Unexpected error:", { to, subject, err });
      await logEmail(to, subject, "FAILED", message);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Order Confirmation
// ---------------------------------------------------------------------------

/**
 * Fetch order data and send the confirmation email to the customer.
 *
 * Designed to be used fire-and-forget from checkout:
 * ```ts
 * sendOrderConfirmationEmail(order.id).catch((err) => {
 *   console.error("Failed to send order confirmation email", err);
 * });
 * ```
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!order || !order.customer?.email) {
    console.warn(`[Email] sendOrderConfirmationEmail: no order or email for id=${orderId}`);
    return;
  }

  await sendEmail({
    to: order.customer.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    react: OrderConfirmationEmail({
      customerName: order.customer.name || "Customer",
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        // toNumber() already returns a JS number — no outer Number() needed
        price: item.price.toNumber(),
      })),
      subTotal: order.subTotal.toNumber(),
      discountTotal: order.discountTotal.toNumber(),
      shippingTotal: order.shippingTotal.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      shippingAddress: order.shippingAddress as {
        fullName: string;
        addressLine1: string;
        addressLine2?: string | null;
        landmark?: string | null;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
      },
      notes: order.notes,
    }),
  });
}

// ---------------------------------------------------------------------------
// Delivery Status
// ---------------------------------------------------------------------------

/**
 * Send a delivery confirmation email when an order is marked DELIVERED.
 *
 * Designed to be used fire-and-forget from the admin order PATCH route:
 * ```ts
 * sendDeliveryStatusEmail(id).catch((err) => {
 *   console.error("Failed to send delivery status email", err);
 * });
 * ```
 */
export async function sendDeliveryStatusEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  if (!order || !order.customer?.email) {
    console.warn(`[Email] sendDeliveryStatusEmail: no order or email for id=${orderId}`);
    return;
  }

  await sendEmail({
    to: order.customer.email,
    subject: `Your order ${order.orderNumber} has been delivered!`,
    react: DeliveryStatusEmail({
      customerName: order.customer.name || "Customer",
      orderNumber: order.orderNumber,
    }),
  });
}
