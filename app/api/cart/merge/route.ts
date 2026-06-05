import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items } = body; // items should be an array of { productId, variantId, quantity }

    if (!Array.isArray(items)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity) continue;
      
      const existing = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId: item.productId,
          variantId: item.variantId || null,
        }
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId: session.user.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart Merge Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
