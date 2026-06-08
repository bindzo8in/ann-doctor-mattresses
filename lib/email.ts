import { Resend } from "resend";
import prisma from "@/lib/prisma";
import * as React from "react";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import DeliveryStatusEmail from "@/emails/DeliveryStatusEmail";

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactNode;
}

export async function sendEmail({ to, subject, html, react }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && apiKey.length > 0) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Ann Doctor Mattresses <orders@anndoctor.in>",
        to,
        subject,
        ...(react ? { react } : { html: html || "" }),
      });

      if (error) {
        console.error("Resend SDK Error:", error);
      } else {
        console.log(`Email successfully sent to ${to} via Resend SDK: ${subject}`, data);
      }
    } catch (err) {
      console.error("Error sending email via Resend SDK:", err);
    }
  } else {
    let body = html || "";
    if (react) {
      try {
        body = await render(react as React.ReactElement);
      } catch (e) {
        body = "[Failed to render React Email]";
      }
    }

    console.log("==================================================");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(body);
    console.log("==================================================");
  }
}

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || !order.customer?.email) return;

    await sendEmail({
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      react: OrderConfirmationEmail({
        customerName: order.customer.name || "Customer",
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subTotal: Number(order.subTotal),
        discountTotal: Number(order.discountTotal),
        shippingTotal: Number(order.shippingTotal),
        totalAmount: Number(order.totalAmount),
        shippingAddress: order.shippingAddress as any,
        notes: order.notes,
      }),
    });
  } catch (error) {
    console.error("Error in sendOrderConfirmationEmail:", error);
  }
}

export async function sendDeliveryStatusEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    });

    if (!order || !order.customer?.email) return;

    await sendEmail({
      to: order.customer.email,
      subject: `Your order ${order.orderNumber} has been delivered!`,
      react: DeliveryStatusEmail({
        customerName: order.customer.name || "Customer",
        orderNumber: order.orderNumber,
      }),
    });
  } catch (error) {
    console.error("Error in sendDeliveryStatusEmail:", error);
  }
}
