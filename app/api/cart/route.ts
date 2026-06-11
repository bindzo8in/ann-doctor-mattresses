import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateCartTotals } from "@/lib/checkout";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({
      items: [],
      subTotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      totalAmount: 0,
      pincode: null,
    });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({
        items: [],
        subTotal: 0,
        discountTotal: 0,
        shippingTotal: 0,
        totalAmount: 0,
      });
    }

    // Look up the user's default address pincode for shipping estimate
    const defaultAddress = await prisma.address.findFirst({
      where: { userId: session.user.id, isDefault: true },
      select: { postalCode: true },
    });
    // Fall back to any address if no default is set
    const anyAddress = !defaultAddress
      ? await prisma.address.findFirst({
          where: { userId: session.user.id },
          select: { postalCode: true },
          orderBy: { createdAt: "desc" },
        })
      : null;
    const pincode = defaultAddress?.postalCode ?? anyAddress?.postalCode ?? undefined;

    const itemsForTotals = cartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      isCustom: item.isCustom,
      customData: item.customData,
    }));

    const calculation = await calculateCartTotals(itemsForTotals, pincode);

    // Enrich cart items with backend calculation details
    const enrichedItems = cartItems.map((cartItem, index) => {
      const calc = calculation.items[index];

      return {
        ...cartItem,
        quantityPurchased: calc?.quantityPurchased ?? cartItem.quantity,
        quantityFree: calc?.quantityFree ?? 0,
        totalDelivered: calc?.totalDelivered ?? cartItem.quantity,
        unitPrice: calc?.unitPrice ?? (cartItem.isCustom && cartItem.customData ? Number((cartItem.customData as any).calculatedPrice) : Number(cartItem.variant?.salePrice || 0)),
        totalPaid: calc?.totalPaid ?? ((cartItem.isCustom && cartItem.customData ? Number((cartItem.customData as any).calculatedPrice) : Number(cartItem.variant?.salePrice || 0)) * cartItem.quantity),
        saved: calc?.saved ?? 0,
        offerType: calc?.offerType ?? null,
        offerName: calc?.offerName ?? null,
      };
    });

    return NextResponse.json({
      items: enrichedItems,
      subTotal: calculation.subTotal,
      discountTotal: calculation.discountTotal,
      shippingTotal: calculation.shippingTotal,
      totalAmount: calculation.totalAmount,
      pincode: pincode ?? null,
    });
  } catch (error) {
    console.error("Cart GET Error:", error);
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
    const { productId, variantId, quantity, isCustom, customData, color } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (quantity > 20) {
      return NextResponse.json({ message: "Maximum quantity per item is 20" }, { status: 400 });
    }

    let existing;
    if (isCustom) {
      const items = await prisma.cartItem.findMany({
        where: {
          userId: session.user.id,
          productId,
          isCustom: true,
          color: color || null,
        }
      });
      existing = items.find(item => JSON.stringify(item.customData) === JSON.stringify(customData));
    } else {
      existing = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          isCustom: false,
          color: color || null,
        }
      });
    }

    let cartItem;
    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > 20) {
        return NextResponse.json({ message: "Maximum quantity per item is 20" }, { status: 400 });
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          quantity,
          isCustom: isCustom || false,
          customData: customData || null,
          color: color || null,
        },
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Cart POST Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined || quantity < 1) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    if (quantity > 20) {
      return NextResponse.json({ message: "Maximum quantity per item is 20" }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId, userId: session.user.id },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cart PATCH Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ message: "Missing item ID" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
