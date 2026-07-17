"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { auditLogger } from "@/lib/audit";
import { hasBetterAuthPermission } from "@/lib/auth-permissions";

export async function getCategories(limit?: number, onlyWithProducts: boolean = false) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!(await hasBetterAuthPermission("categories.read"))) {
    throw new Error("Unauthorized");
  }

  const categories = await prisma.category.findMany({
    where: onlyWithProducts
      ? {
        products: {
          some: {},
        },
      }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    },
    take: limit,
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    productCount: _count.products,
  }));
}

export async function createCategory(data: { 
  name: string; 
  slug: string; 
  description?: string | null;
  features?: any | null;
  layerImageUrl?: string | null;
  layerImagePublicId?: string | null;
  layerVideoUrl?: string | null;
  layerVideoPublicId?: string | null;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  thumbnailUrl?: string | null; 
  thumbnailPublicId?: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!(await hasBetterAuthPermission("categories.create"))) {
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
      description: data.description || null,
      features: data.features || null,
      layerImageUrl: data.layerImageUrl || null,
      layerImagePublicId: data.layerImagePublicId || null,
      layerVideoUrl: data.layerVideoUrl || null,
      layerVideoPublicId: data.layerVideoPublicId || null,
      coverImageUrl: data.coverImageUrl || null,
      coverImagePublicId: data.coverImagePublicId || null,
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
    actorRole: session!.user.role ?? undefined,
    newValues: category,
  });

  return category;
}

export async function updateCategory(id: string, data: { 
  name?: string; 
  slug?: string; 
  description?: string | null;
  features?: any | null;
  layerImageUrl?: string | null;
  layerImagePublicId?: string | null;
  layerVideoUrl?: string | null;
  layerVideoPublicId?: string | null;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  thumbnailUrl?: string | null; 
  thumbnailPublicId?: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!(await hasBetterAuthPermission("categories.update"))) {
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
      description: data.description !== undefined ? data.description : undefined,
      features: data.features !== undefined ? data.features : undefined,
      layerImageUrl: data.layerImageUrl !== undefined ? data.layerImageUrl : undefined,
      layerImagePublicId: data.layerImagePublicId !== undefined ? data.layerImagePublicId : undefined,
      layerVideoUrl: data.layerVideoUrl !== undefined ? data.layerVideoUrl : undefined,
      layerVideoPublicId: data.layerVideoPublicId !== undefined ? data.layerVideoPublicId : undefined,
      coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : undefined,
      coverImagePublicId: data.coverImagePublicId !== undefined ? data.coverImagePublicId : undefined,
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
    actorRole: session!.user.role ?? undefined,
    newValues: category,
  });

  return category;
}

export async function deleteCategory(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!(await hasBetterAuthPermission("categories.delete"))) {
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
    actorRole: session!.user.role ?? undefined,
    oldValues: category,
  });

  return { success: true };
}
