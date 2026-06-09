import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { auditLogger } from "@/lib/audit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        isActive: body.isActive,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        buyQuantity: Number(body.buyQuantity) || 1,
        getQuantity: Number(body.getQuantity) || 1,
        productIds: body.productIds,
        categoryIds: body.categoryIds,
      }
    });

    await auditLogger.log({
      action: "UPDATE",
      entityType: "Promotion",
      entityId: promotion.id,
      description: `Updated promotion: ${promotion.name}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      newValues: promotion,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Admin Promotion PUT Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    
    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.promotion.delete({ where: { id } });

    await auditLogger.log({
      action: "DELETE",
      entityType: "Promotion",
      entityId: id,
      description: `Deleted promotion: ${promotion.name}`,
      actorUserId: session.user.id,
      actorRole: session.user.role,
      oldValues: promotion,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Promotion DELETE Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
