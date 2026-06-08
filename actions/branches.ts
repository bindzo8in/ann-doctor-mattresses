"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@/app/generated/prisma/enums";

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

export async function createBranch(data: { name: string; address?: string; phone?: string; isActive?: boolean }) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.create({
    data
  });
  return branch;
}

export async function updateBranch(id: string, data: { name?: string; address?: string; phone?: string; isActive?: boolean }) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  const branch = await prisma.branch.update({
    where: { id },
    data
  });
  return branch;
}

export async function deleteBranch(id: string) {
  const session = await auth();
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    throw new Error("Unauthorized");
  }

  await prisma.branch.delete({
    where: { id }
  });
  return { success: true };
}
