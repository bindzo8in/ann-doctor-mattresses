import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { auth } from "@/auth";
import { auditLogger } from "@/lib/audit";

export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const name = body.name?.trim();
    const thumbnailUrl = body.thumbnailUrl;
    const thumbnailPublicId = body.thumbnailPublicId;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const existing = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        thumbnailUrl,
        thumbnailPublicId,
      },
    });

    const session = await auth();
    if (session?.user) {
      await auditLogger.log({
        action: "UPDATE",
        entityType: "Category",
        entityId: category.id,
        description: `Updated category: ${category.name}`,
        actorUserId: session.user.id,
        actorRole: session.user.role,
        newValues: category,
      });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const productCount = await prisma.product.count({
      where: {
        categoryId: id,
      },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete category because products are assigned to it." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id },
    });

    const session = await auth();
    if (session?.user) {
      await auditLogger.log({
        action: "DELETE",
        entityType: "Category",
        entityId: id,
        description: `Deleted category: ${category.name}`,
        actorUserId: session.user.id,
        actorRole: session.user.role,
        oldValues: category,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}