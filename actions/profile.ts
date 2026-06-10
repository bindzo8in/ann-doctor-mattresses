"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { auditLogger } from "@/lib/audit";
import { env } from "@/env";
import { Redis } from "@upstash/redis";

export async function updateCustomerProfile(data: {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, currentPassword, newPassword } = data;

  if (!name) {
    throw new Error("Name is required");
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

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      password: hashedPassword,
    },
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "User",
    entityId: updatedUser.id,
    description: `User updated their profile`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: { name: updatedUser.name, passwordChanged: !!newPassword },
  });

  if (newPassword && env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    await redis.set(`jwtRevokedBefore:${session.user.id}`, Math.floor(Date.now() / 1000));
  }

  return { success: true };
}
