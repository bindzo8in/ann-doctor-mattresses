"use server";

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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
      to: process.env.EMAIL_FROM || "admin@anndoctor.in",
      subject: `New Contact Request from ${data.name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong><br/>${data.message}</p>
      `,
    });

    // Auto-reply to Customer
    await sendEmail({
      to: data.email,
      subject: `We received your message - Ann Doctor Mattresses`,
      html: `
        <h3>Thank you for reaching out, ${data.name}!</h3>
        <p>We have received your message and our team will get back to you shortly.</p>
        <hr/>
        <p><em>Your message:</em><br/>${data.message}</p>
      `,
    });

    return { success: true, contact };
  } catch (error) {
    console.error("Failed to submit contact message", error);
    throw new Error("Failed to submit contact message");
  }
}

import { uploadImage } from "@/lib/cloudinary";

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
      to: process.env.EMAIL_FROM || "admin@anndoctor.in",
      subject: `New Complaint Logged: ${subject || "General"}`,
      html: `
        <h3>New Complaint (#${complaint.id})</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        ${imageUrl ? `<p><strong>Attachment:</strong> <a href="${imageUrl}">View Image</a></p>` : ""}
      `,
    });

    // Auto-reply to Customer
    await sendEmail({
      to: email,
      subject: `Complaint Received (#${complaint.id}) - Ann Doctor Mattresses`,
      html: `
        <h3>Hi ${name},</h3>
        <p>We have successfully logged your complaint (Ticket #${complaint.id}). Our support team will investigate and respond to you as soon as possible.</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Details:</strong><br/>${message}</p>
        <p>Thank you for your patience.</p>
      `,
    });

    return { success: true, complaintId: complaint.id };
  } catch (error) {
    console.error("Failed to submit complaint", error);
    throw new Error("Failed to submit complaint");
  }
}
