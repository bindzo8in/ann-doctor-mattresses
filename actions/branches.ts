"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@/app/generated/prisma/enums";
import { auditLogger } from "@/lib/audit";

export async function getBranches() {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" }
  });
  return branches;
}

export async function createBranch(data: { name: string; address?: string; city?: string; state?: string; phone?: string; googleMapUrl?: string; isActive?: boolean }) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.create({
    data
  });

  await auditLogger.log({
    action: "CREATE",
    entityType: "Branch",
    entityId: branch.id,
    description: `Created new branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: branch,
  });

  return branch;
}

export async function updateBranch(id: string, data: { name?: string; address?: string; city?: string; state?: string; phone?: string; googleMapUrl?: string; isActive?: boolean }) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.update({
    where: { id },
    data
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "Branch",
    entityId: branch.id,
    description: `Updated branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    newValues: branch,
  });

  return branch;
}

export async function deleteBranch(id: string) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.delete({
    where: { id }
  });

  await auditLogger.log({
    action: "DELETE",
    entityType: "Branch",
    entityId: id,
    description: `Deleted branch: ${branch.name}`,
    actorUserId: session.user.id,
    actorRole: session.user.role,
    oldValues: branch,
  });

  return { success: true };
}
