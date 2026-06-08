import prisma from "@/lib/prisma";
import { PromotionType } from "@/app/generated/prisma/client";
import { roundPrice } from "@/lib/price";

/**
 * Zone-based delivery charge table.
 * Rates are ALWAYS applied — no free-delivery threshold.
 *
 * Pincode zone mapping (first digit):
 *  5 / 6 → South India (TN, KA, KL, AP, TS) → ₹50
 *  1 / 2 → North India (Delhi, UP, Rajasthan) → ₹150
 *  3 / 4 → West India  (Gujarat, MH)          → ₹150
 *  7 / 8 → East India  (WB, Odisha, NE)       → ₹250
 *  9     → Far regions                         → ₹350
 *  other → default (unknown)                   → ₹50
 */
export async function getShippingCharge(pincode?: string | null): Promise<number> {
  const zones = await prisma.deliveryZone.findMany();
  
  if (!pincode) {
    const defaultZone = zones.find(z => z.isDefault);
    return defaultZone ? Number(defaultZone.charge) : 50;
  }
  
  const firstDigit = pincode.trim().charAt(0);
  const matchedZone = zones.find(z => z.pincodePrefixes.includes(firstDigit));
  
  if (matchedZone) {
    return Number(matchedZone.charge);
  }
  
  const defaultZone = zones.find(z => z.isDefault);
  return defaultZone ? Number(defaultZone.charge) : 50;
}

export interface CartCalculationResult {

  subTotal: number;
  discountTotal: number;
  shippingTotal: number;
  totalAmount: number;
  appliedPromotion: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    price: number;
    discountedPrice: number;
    quantityPurchased: number;
    quantityFree: number;
    totalDelivered: number;
    unitPrice: number;
    totalPaid: number;
    saved: number;
    offerType: string | null;
    offerName: string | null;
  }>;
}

export async function calculateCartTotals(
  cartItems: { productId: string; variantId: string | null; quantity: number; isCustom?: boolean; customData?: any }[],
  pincode?: string
): Promise<CartCalculationResult> {
  // Fetch variants to get real prices for non-custom items
  const variantIds = cartItems.map((item) => item.variantId).filter(Boolean) as string[];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
  });

  const variantPriceMap = new Map(
    variants.map((v) => [v.id, Number(v.salePrice)])
  );

  // Fetch products first to get customSizePricing for secure server-side calculation
  const productIds = cartItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, categoryId: true, customSizePricing: true, allowCustomSize: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const processedItems = cartItems.map((item) => {
    let rawPrice = 0;
    
    // SERVER-SIDE Custom Price Calculation
    if (item.isCustom && item.customData) {
      const product = productMap.get(item.productId);
      if (product && product.allowCustomSize && product.customSizePricing) {
        const pricing = product.customSizePricing as Record<string, any>;
        const thickness = String(item.customData.thickness);
        
        if (pricing[thickness]) {
          const area = (Number(item.customData.width) * Number(item.customData.length)) / 144;
          rawPrice = area * Number(pricing[thickness]);
        }
      }
    } else if (item.variantId && variantPriceMap.has(item.variantId)) {
      rawPrice = variantPriceMap.get(item.variantId)!;
    }
    const price = roundPrice(rawPrice);
    
    return {
      id: Math.random().toString(36).substring(7), // temporary id
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      discountedPrice: price,
      quantityPurchased: item.quantity,
      quantityFree: 0,
      totalDelivered: item.quantity,
      unitPrice: price,
      totalPaid: roundPrice(price * item.quantity),
      saved: 0,
      offerType: null as string | null,
      offerName: null as string | null,
    };
  });

  const productCategoryMap = new Map(
    Array.from(productMap.entries()).map(([id, p]) => [id, p.categoryId])
  );

  // Calculate Discounts using Promotion Engine
  const activePromotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } }
          ]
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        }
      ]
    },
  });

  let bestDiscount = 0;
  let bestPromotionId: string | null = null;
  let finalItems = processedItems.map(item => ({ ...item }));

  for (const promo of activePromotions) {
    let currentDiscount = 0;
    const tempItems = processedItems.map((item) => ({ ...item }));

    if (promo.type === PromotionType.BUY_X_GET_Y) {
      for (const item of tempItems) {
        let isApplicable = true;
        if (promo.productIds.length > 0 && !promo.productIds.includes(item.productId)) {
          isApplicable = false;
        }

        if (promo.categoryIds.length > 0) {
          const catId = productCategoryMap.get(item.productId);
          if (!catId || !promo.categoryIds.includes(catId)) {
            isApplicable = false;
          }
        }

        const buyQty = promo.buyQuantity ?? 1;
        const getQty = promo.getQuantity ?? 1;

        if (isApplicable && item.quantity >= buyQty) {
          const freeQuantity = Math.floor(item.quantity / buyQty) * getQty;
          
          if (freeQuantity > 0) {
            item.quantityPurchased = item.quantity;
            item.quantityFree = freeQuantity;
            item.totalDelivered = item.quantity + freeQuantity;
            item.unitPrice = item.price;
            item.totalPaid = roundPrice(item.price * item.quantity);
            item.saved = roundPrice(item.price * freeQuantity);
            item.offerType = (buyQty === 1 && getQty === 1) ? "BUY_1_GET_1" : "BUY_X_GET_Y";
            item.offerName = promo.name;
            item.discountedPrice = item.price;
            
            currentDiscount += item.saved;
          }
        }
      }
    }

    if (currentDiscount > bestDiscount) {
      bestDiscount = currentDiscount;
      bestPromotionId = promo.id;
      finalItems = tempItems;
    }
  }

  // Calculate Subtotal and Shipping based on BOGO delivered items
  let rawSubTotal = 0;
  for (const item of finalItems) {
    rawSubTotal += item.totalDelivered * item.unitPrice;
  }
  const subTotal = roundPrice(rawSubTotal);

  const discountTotal = roundPrice(bestDiscount);
  const afterDiscount = subTotal - discountTotal;

  // Always charge zone-based delivery — no free-delivery threshold
  const shippingTotal = await getShippingCharge(pincode); // already a whole number

  const totalAmount = roundPrice(afterDiscount + shippingTotal);

  return {
    subTotal,
    discountTotal,
    shippingTotal,
    totalAmount,
    appliedPromotion: bestPromotionId,
    items: finalItems,
  };
}
