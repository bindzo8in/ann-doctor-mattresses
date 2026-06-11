import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { auth } from "@/auth";
import { auditLogger } from "@/lib/audit";
import { userHasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const cursor = req.nextUrl.searchParams.get("cursor");

  const take = 20;

  const categories = await prisma.category.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: {
      name: "asc",
    },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  let nextCursor: string | null = null;

  if (categories.length > take) {
    const nextItem = categories.pop();
    nextCursor = nextItem!.id;
  }

  return NextResponse.json({
    items: categories,
    nextCursor,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!userHasPermission(session?.user, "categories.create")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const name = body.name?.trim();
  const thumbnailUrl = body.thumbnailUrl;
  const thumbnailPublicId = body.thumbnailPublicId;

  if (!name) {
    return NextResponse.json(
      { message: "Name required" },
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

  if (existing) {
    return NextResponse.json(
      { message: "Category already exists" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      thumbnailUrl,
      thumbnailPublicId,
    },
  });

  if (session?.user) {
    await auditLogger.log({
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      description: `Created category: ${category.name}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: category,
    });
  }

  return NextResponse.json(category);
}