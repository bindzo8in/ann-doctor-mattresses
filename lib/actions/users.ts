"use server"

import prisma from "@/lib/prisma"
import { UserRole } from "@/app/generated/prisma/client"
import bcryptjs from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auditLogger } from "@/lib/audit"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function getAdmins() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN]
      }
    },
    include: {
      branch: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return admins
}

export async function createBranchAdmin(data: { name: string; email: string; password: string; branchId: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await auth.api.createUser({
      headers: await headers(),
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: UserRole.BRANCH_ADMIN,
        data: {
          branchId: data.branchId,
        }
      }
    });

    const user = result.user as any;

    await auditLogger.log({
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      description: `Created new Branch Admin: ${user.email}`,
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role,
      metadata: { email: user.email, branchId: data.branchId }
    });

    revalidatePath("/dashboard/users");
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create user." };
  }
}

export async function changeAdminPassword(userId: string, newPassword: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const targetUser = await auth.api.getUser({
    headers: await headers(),
    query: {
      id: userId
    }
  });

  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  if (targetUser.role !== UserRole.BRANCH_ADMIN) {
    return { success: false, error: "Can only change passwords for Branch Admins." };
  }

  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: {
        userId,
        newPassword,
      }
    });

    await auditLogger.log({
      action: "UPDATE_PASSWORD",
      entityType: "User",
      entityId: userId,
      description: `Changed password for Branch Admin: ${targetUser.email}`,
      actorUserId: session?.user?.id,
      actorRole: session?.user?.role,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}
