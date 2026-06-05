"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function updateCustomerProfile(data: {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, email, currentPassword, newPassword } = data;

  if (!name || !email) {
    throw new Error("Name and Email are required");
  }

  // Check if email is taken by another user
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      NOT: { id: session.user.id },
    },
  });

  if (existingUser) {
    throw new Error("Email is already in use");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let hashedPassword = user.password;

  // Handle password update
  if (newPassword && newPassword.trim() !== "") {
    if (!currentPassword) {
      throw new Error("Current password is required to set a new password");
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new Error("Incorrect current password");
    }

    hashedPassword = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  return { success: true };
}
