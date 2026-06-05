import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Admin Promotions GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
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

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Admin Promotions POST Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
