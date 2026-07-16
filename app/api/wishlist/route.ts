import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([]);
  }

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    // Check if it already exists
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      // Delete it (toggle off)
      await prisma.wishlistItem.delete({
        where: {
          id: existing.id,
        },
      });
      return NextResponse.json({ wishlisted: false });
    } else {
      // Create it (toggle on)
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
