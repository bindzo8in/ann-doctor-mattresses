"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { auditLogger } from "@/lib/audit";

export async function getCategories() {
  const session = await auth();
  if (!userHasPermission(session?.user, "categories.read")) {
    throw new Error("Unauthorized");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return categories;
}

export async function createCategory(data: { name: string; slug: string; thumbnailUrl?: string | null; thumbnailPublicId?: string | null }) {
  const session = await auth();
  if (!userHasPermission(session?.user, "categories.create")) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.category.findUnique({
    where: { slug: data.slug }
  });

  if (existing) {
    throw new Error("Category with this slug already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      thumbnailUrl: data.thumbnailUrl || null,
      thumbnailPublicId: data.thumbnailPublicId || null,
    }
  });

  await auditLogger.log({
    action: "CREATE",
    entityType: "Category",
    entityId: category.id,
    description: `Created new category: ${category.name}`,
    actorUserId: session!.user.id,
    actorRole: session!.user.role,
    newValues: category,
  });

  return category;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; thumbnailUrl?: string | null; thumbnailPublicId?: string | null }) {
  const session = await auth();
  if (!userHasPermission(session?.user, "categories.update")) {
    throw new Error("Unauthorized");
  }

  if (data.slug) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug }
    });
    if (existing && existing.id !== id) {
      throw new Error("Category with this slug already exists");
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      thumbnailUrl: data.thumbnailUrl !== undefined ? data.thumbnailUrl : undefined,
      thumbnailPublicId: data.thumbnailPublicId !== undefined ? data.thumbnailPublicId : undefined,
    }
  });

  await auditLogger.log({
    action: "UPDATE",
    entityType: "Category",
    entityId: category.id,
    description: `Updated category: ${category.name}`,
    actorUserId: session!.user.id,
    actorRole: session!.user.role,
    newValues: category,
  });

  return category;
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!userHasPermission(session?.user, "categories.delete")) {
    throw new Error("Unauthorized");
  }

  // Check if there are any products in this category
  const productsCount = await prisma.product.count({
    where: { categoryId: id }
  });

  if (productsCount > 0) {
    throw new Error(`Cannot delete category because it has ${productsCount} products. Please reassign or delete the products first.`);
  }

  const category = await prisma.category.delete({
    where: { id }
  });

  await auditLogger.log({
    action: "DELETE",
    entityType: "Category",
    entityId: id,
    description: `Deleted category: ${category.name}`,
    actorUserId: session!.user.id,
    actorRole: session!.user.role,
    oldValues: category,
  });

  return { success: true };
}
