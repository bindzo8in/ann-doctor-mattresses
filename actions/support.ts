"use server";

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { auth } from "@/auth-old";
import { auditLogger } from "@/lib/audit";
import { env } from "@/env";
import * as React from "react";
import ContactMessageEmail from "@/emails/ContactMessageEmail";
import ContactAutoReplyEmail from "@/emails/ContactAutoReplyEmail";
import ComplaintLoggedEmail from "@/emails/ComplaintLoggedEmail";
import ComplaintAutoReplyEmail from "@/emails/ComplaintAutoReplyEmail";
import { uploadImage } from "@/lib/cloudinary";

export async function submitContactMessage(data: { name: string; email: string; message: string }) {
  try {
    const contact = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });

    // Notify Admin
    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `New Contact Request from ${data.name}`,
      react: ContactMessageEmail({
        name: data.name,
        email: data.email,
        message: data.message,
      }),
    });

    // Auto-reply to Customer
    await sendEmail({
      to: data.email,
      subject: `We received your message - Ann Doctor Mattresses`,
      react: ContactAutoReplyEmail({
        name: data.name,
        message: data.message,
      }),
    });

    const session = await auth();
    await auditLogger.log({
      action: "CREATE",
      entityType: "ContactMessage",
      entityId: contact.id,
      description: `New contact message from ${data.name}`,
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role,
    });

    return { success: true, contact };
  } catch (error) {
    console.error("Failed to submit contact message", error);
    throw new Error("Failed to submit contact message");
  }
}

export async function submitComplaint(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const image = formData.get("image") as File | null;

    let imageUrl = null;
    let imagePublicId = null;

    if (image && image.size > 0) {
      const uploadResult = await uploadImage(image, "complaints");
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const complaint = await prisma.complaint.create({
      data: {
        name,
        email,
        subject,
        message,
        imageUrl,
        imagePublicId,
      },
    });

    // Notify Admin
    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `New Complaint Logged: ${subject || "General"}`,
      react: ComplaintLoggedEmail({
        id: complaint.id,
        name,
        email,
        subject,
        message,
        imageUrl,
      }),
    });

    // Auto-reply to Customer
    await sendEmail({
      to: email,
      subject: `Complaint Received (#${complaint.id}) - Ann Doctor Mattresses`,
      react: ComplaintAutoReplyEmail({
        id: complaint.id,
        name,
        subject,
        message,
      }),
    });

    const session = await auth();
    await auditLogger.log({
      action: "CREATE",
      entityType: "Complaint",
      entityId: complaint.id,
      description: `New complaint logged by ${name}`,
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role,
    });

    return { success: true, complaintId: complaint.id };
  } catch (error) {
    console.error("Failed to submit complaint", error);
    throw new Error("Failed to submit complaint");
  }
}
