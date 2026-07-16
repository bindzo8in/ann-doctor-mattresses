import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";
import { auditLogger } from "@/lib/audit";
import { userHasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!userHasPermission(session?.user, "promotions.read")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "100");

    const promotions = await prisma.promotion.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (promotions.length > limit) {
      const nextItem = promotions.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({ promotions, nextCursor });
  } catch (error) {
    console.error("Admin Promotions GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!userHasPermission(session?.user, "promotions.create")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, type, isActive, startDate, endDate, buyQuantity, getQuantity, productIds, categoryIds } = body;

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description,
        type,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        buyQuantity: Number(buyQuantity) || 1,
        getQuantity: Number(getQuantity) || 1,
        productIds: productIds || [],
        categoryIds: categoryIds || [],
      }
    });

    await auditLogger.log({
      action: "CREATE",
      entityType: "Promotion",
      entityId: promotion.id,
      description: `Created new promotion: ${promotion.name}`,
      actorUserId: session!.user.id,
      actorRole: session!.user.role,
      newValues: promotion,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Admin Promotions POST Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
