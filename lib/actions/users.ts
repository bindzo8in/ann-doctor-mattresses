"use server"

import prisma from "@/lib/prisma"
import { UserRole } from "@/app/generated/prisma/client"
import bcryptjs from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auditLogger } from "@/lib/audit"
import { auth } from "@/auth-old"

export async function getAdmins() {
  const session = await auth();
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
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    return { success: false, error: "Email already in use." }
  }

  const hashedPassword = await bcryptjs.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: UserRole.BRANCH_ADMIN,
      branchId: data.branchId
    }
  })

  await auditLogger.log({
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    description: `Created new Branch Admin: ${user.email}`,
    actorUserId: session?.user?.id,
    actorRole: session?.user?.role,
    metadata: { email: user.email, branchId: user.branchId }
  })

  revalidatePath("/dashboard/users")
  return { success: true, user }
}

export async function changeAdminPassword(userId: string, newPassword: string) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!targetUser) {
    return { success: false, error: "User not found." }
  }

  // Optional: Only allow changing passwords for branch admins
  if (targetUser.role !== UserRole.BRANCH_ADMIN) {
    return { success: false, error: "Can only change passwords for Branch Admins." }
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword
    }
  })

  await auditLogger.log({
    action: "UPDATE_PASSWORD",
    entityType: "User",
    entityId: userId,
    description: `Changed password for Branch Admin: ${targetUser.email}`,
    actorUserId: session?.user?.id,
    actorRole: session?.user?.role,
  })

  return { success: true }
}
