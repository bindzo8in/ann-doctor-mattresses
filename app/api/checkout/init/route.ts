import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth-old";
import { calculateCartTotals } from "@/lib/checkout";
import { OrderStatus, CheckoutSource } from "@/app/generated/prisma/client";
import { env } from "@/env";
import { roundPrice, toRazorpayAmount } from "@/lib/price";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const getRedisInstance = () => {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
};

const redis = getRedisInstance();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { addressId, notes, source, buyNowItem, idempotencyKey } = body;

    if (idempotencyKey && redis) {
      const isNew = await redis.set(`idempotency:checkout:${session.user.id}:${idempotencyKey}`, "processing", { nx: true, ex: 60 * 60 * 24 });
      if (!isNew) {
        return NextResponse.json({ message: "Duplicate checkout request detected" }, { status: 409 });
      }
    }

    if (!addressId) {
      return NextResponse.json({ message: "Shipping address is required" }, { status: 400 });
    }

    // Fetch address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ message: "Invalid address" }, { status: 400 });
    }

    let calculation: Awaited<ReturnType<typeof calculateCartTotals>>;
    let orderItemsData: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
      productName: string;
      variantData: any;
      price: number;
      quantityPurchased: number;
      unitPrice: number;
      totalPaid: number;
      offerType: string | null;
      color: string | null;
    }> = [];

    const checkoutSource = source === "BUY_NOW" ? CheckoutSource.BUY_NOW : CheckoutSource.CART;

    if (checkoutSource === CheckoutSource.BUY_NOW) {
      if (!buyNowItem || !buyNowItem.productId || !buyNowItem.quantity || buyNowItem.quantity < 1) {
        return NextResponse.json({ message: "Invalid buy now item details" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: buyNowItem.productId },
      });

      if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 400 });
      }

      let variant = null;
      if (buyNowItem.variantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: buyNowItem.variantId },
        });

        if (!variant || variant.productId !== buyNowItem.productId) {
          return NextResponse.json({ message: "Invalid product variant" }, { status: 400 });
        }
      }

      const itemsForTotals = [{
        productId: buyNowItem.productId,
        variantId: buyNowItem.variantId,
        quantity: buyNowItem.quantity,
        isCustom: buyNowItem.isCustom,
        customData: buyNowItem.customData,
      }];

      calculation = await calculateCartTotals(itemsForTotals, address.postalCode);

      orderItemsData = calculation.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.totalDelivered,
        productName: product.name,
        variantData: buyNowItem.isCustom 
          ? { isCustom: true, customData: buyNowItem.customData } 
          : (variant || {}),
        price: item.unitPrice,
        quantityPurchased: item.quantityPurchased,
        unitPrice: item.unitPrice,
        totalPaid: item.totalPaid,
        offerType: item.offerType,
        color: buyNowItem.color || null,
      }));
    } else {
      // Fetch cart
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: {
          product: true,
          variant: true,
        }
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
      }

      // Calculate totals
      calculation = await calculateCartTotals(cartItems, address.postalCode);

      orderItemsData = calculation.items.map((item, index) => {
        const originalItem = cartItems[index];
        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.totalDelivered,
          productName: originalItem?.product.name || "Unknown Product",
          variantData: originalItem?.isCustom
            ? { isCustom: true, customData: originalItem.customData }
            : (originalItem?.variant || {}),
          price: item.unitPrice,
          quantityPurchased: item.quantityPurchased,
          quantityFree: item.quantityFree,
          unitPrice: item.unitPrice,
          totalPaid: item.totalPaid,
          offerType: item.offerType,
          color: originalItem?.color || null,
        };
      });
    }

    // Create Order Number without race condition
    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Initialize Razorpay Order via REST API (Basic Auth)
    const razorpayKeyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = env.RAZORPAY_KEY_SECRET;
    const authHeader = "Basic " + Buffer.from(razorpayKeyId + ":" + razorpayKeySecret).toString("base64");

    // Ensure whole-rupee amount for Razorpay (paise = rupees × 100)
    const finalAmount = roundPrice(calculation.totalAmount);
    const amountInPaise = toRazorpayAmount(finalAmount);

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderNumber,
      })
    });

    if (!rzpRes.ok) {
      const errorData = await rzpRes.json();
      console.error("Razorpay Error:", errorData);
      // Remove idempotency key if external API fails, allowing retry
      if (idempotencyKey && redis) {
        await redis.del(`idempotency:checkout:${session.user.id}:${idempotencyKey}`);
      }
      return NextResponse.json({ message: "Failed to initialize payment gateway" }, { status: 500 });
    }

    const rzpOrder = await rzpRes.json();

    // Create Order and Payment in Database atomically via nested create
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        status: OrderStatus.PENDING_PAYMENT,
        checkoutSource,
        subTotal: calculation.subTotal,
        discountTotal: calculation.discountTotal,
        shippingTotal: calculation.shippingTotal,
        totalAmount: calculation.totalAmount,
        shippingAddress: address as any, // Snapshot
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
        payments: {
          create: {
            razorpayOrderId: rzpOrder.id,
            amount: finalAmount,
          }
        }
      }
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: finalAmount,
    });
  } catch (error) {
    console.error("Checkout Init Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
