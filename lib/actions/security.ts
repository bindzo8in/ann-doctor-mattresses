"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { securityLogger } from "@/lib/security/audit";
import { headers } from "next/headers";

export async function getLockedAccounts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "BRANCH_ADMIN") {
    throw new Error("Unauthorized");
  }

  const lockedUsers = await prisma.user.findMany({
    where: {
      banExpires: {
        not: null,
        gt: new Date()
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      banExpires: true,
      banned: true,
      role: true
    },
    orderBy: {
      banExpires: "desc"
    }
  });

  return lockedUsers;
}

export async function unlockAccount(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "BRANCH_ADMIN") {
    throw new Error("Unauthorized");
  }

  // Get user details for logging before unbanning
  const user = await auth.api.getUser({
    headers: await headers(),
    query: {
      id: userId
    }
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  // Use Better Auth Admin API to unban the user
  await auth.api.unbanUser({
    headers: await headers(),
    body: {
      userId,
    }
  });

  await securityLogger.log({
    action: "ACCOUNT_UNLOCKED",
    userId: user.id,
    email: user.email,
    description: `Account manually unlocked by admin: ${session.user.email}`,
  });

  return { success: true };
}

export async function getAuditLogs(params?: {
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "BRANCH_ADMIN") {
    throw new Error("Unauthorized");
  }

  const where: any = {
    entityType: "AuthSecurity"
  };

  if (params?.action) {
    where.action = params.action;
  }
  if (params?.userId) {
    where.entityId = params.userId;
  }
  if (params?.startDate || params?.endDate) {
    where.createdAt = {};
    if (params?.startDate) where.createdAt.gte = params.startDate;
    if (params?.endDate) where.createdAt.lte = params.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params?.skip ?? 0,
      take: params?.take ?? 50,
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total };
}
