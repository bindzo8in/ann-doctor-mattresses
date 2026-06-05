import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { roundPrice } from "@/lib/price";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Ann Doctor Mattresses <orders@anndoctor.in>",
        to,
        subject,
        html,
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
    console.log("==================================================");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(html);
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

    const itemsListHtml = order.items
      .map(
        (item) =>
          `<li>${item.productName} (Qty: ${item.quantity}) - ₹${roundPrice(Number(
            item.price
          )).toLocaleString("en-IN")}</li>`
      )
      .join("");

    const shippingAddress = order.shippingAddress as any;
    const addressHtml = `
      <p>
        <strong>${shippingAddress.fullName}</strong><br />
        ${shippingAddress.addressLine1}<br />
        ${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br />` : ""}
        ${shippingAddress.landmark ? `Landmark: ${shippingAddress.landmark}<br />` : ""}
        ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}<br />
        Phone: ${shippingAddress.phone}
      </p>
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">Order Confirmed!</h2>
        <p>Hello ${order.customer.name},</p>
        <p>Thank you for your purchase. We have received your payment, and your order <strong>${order.orderNumber}</strong> is now confirmed.</p>
        
        <h3 style="color: #0f172a;">Order Summary</h3>
        <ul>
          ${itemsListHtml}
        </ul>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 5px 0; color: #666;">Subtotal:</td>
            <td style="text-align: right; font-weight: bold;">₹${roundPrice(Number(order.subTotal)).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Discount:</td>
            <td style="text-align: right; color: green; font-weight: bold;">-₹${roundPrice(Number(order.discountTotal)).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Shipping:</td>
            <td style="text-align: right; font-weight: bold;">${Number(order.shippingTotal) === 0 ? "Free" : `₹${roundPrice(Number(order.shippingTotal)).toLocaleString("en-IN")}`}</td>
          </tr>
          <tr style="border-top: 1px solid #ddd; font-size: 1.1em;">
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">Total Amount Paid:</td>
            <td style="text-align: right; font-weight: bold; color: #0f172a;">₹${roundPrice(Number(order.totalAmount)).toLocaleString("en-IN")}</td>
          </tr>
        </table>
        
        <h3 style="color: #0f172a; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">Shipping Address</h3>
        ${addressHtml}

        ${order.notes ? `<p><strong>Order Notes:</strong> ${order.notes}</p>` : ""}
        
        <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.9em; color: #777;">
          You can track your order status in your profile dashboard at any time.
        </p>
      </div>
    `;

    await sendEmail({
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
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

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">Order Delivered!</h2>
        <p>Hello ${order.customer.name},</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been successfully delivered!</p>
        <p>We hope you are enjoying your new Ann Doctor mattress / sofa. Thank you for shopping with us.</p>
        
        <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.9em; color: #777;">
          If you have any questions or feedback, please contact our support team.
        </p>
      </div>
    `;

    await sendEmail({
      to: order.customer.email,
      subject: `Your order ${order.orderNumber} has been delivered!`,
      html,
    });
  } catch (error) {
    console.error("Error in sendDeliveryStatusEmail:", error);
  }
}
