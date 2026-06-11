"use client";

import { useState } from "react";
import { ProductDetails, ProductVariantWithDetails } from "@/types/product-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Minus, Plus, Heart, BadgeCheck, Star, StarHalf } from "lucide-react";
import { MattressVariantSelector } from "./variants/mattress-variant-selector";
import { SofaVariantSelector } from "./variants/sofa-variant-selector";
import { CustomSizeSelector } from "./variants/custom-size-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { formatPrice, roundPrice } from "@/lib/price";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { useCheckoutStore } from "@/hooks/use-checkout";
import { CheckoutSource } from "@/app/generated/prisma/enums";
import { useWishlist } from "@/hooks/use-wishlist";
import { getColorByValue } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductDetails;
}

export function ProductPurchaseCardV2({ product }: Props) {
  const sortedVariants = [...product.variants].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithDetails>(
    sortedVariants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customData, setCustomData] = useState<{
    width: number;
    length: number;
    thickness: number;
    calculatedPrice: number;
    isValid: boolean;
  } | null>(null);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : null
  );

  const { addToCart, isAddingToCart } = useCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const router = useRouter();

  const actualReviewCount = product.reviews?.length || 0;
  const reviewCount = actualReviewCount > 0 ? actualReviewCount : 100;
  const averageRating = actualReviewCount > 0 
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / actualReviewCount
    : 5;

  const { wishlistItems, toggleWishlist, isAuthenticated } = useWishlist();
  const currentIsWishlisted = wishlistItems.some(item => item.productId === product.id);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }
    try {
      const added = await toggleWishlist(product.id);
      if (added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    try {
      if (isCustomMode) {
        if (!customData?.isValid) {
          toast.error("Please enter valid dimensions for the custom size.");
          return;
        }
        await addToCart({
          productId: product.id,
          variantId: null,
          quantity,
          isCustom: true,
          customData,
          color: selectedColor || undefined,
        } as any);
      } else {
        await addToCart({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity,
          color: selectedColor || undefined,
        });
      }
      toast.success("Added to cart");
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        toast.error("Please login to add items to cart");
        router.push(`${routes.login}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      } else {
        toast.error(error.message || "Failed to add to cart. Please ensure you are logged in.");
      }
    }
  };

  const setCheckoutSession = useCheckoutStore(state => state.setCheckoutSession);

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      // Dynamic auth check using cart API status
      const authCheck = await fetch("/api/cart", { cache: "no-store" });
      if (authCheck.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (isCustomMode && !customData?.isValid) {
        toast.error("Please enter valid dimensions for the custom size.");
        setIsBuyingNow(false);
        return;
      }

      setCheckoutSession(CheckoutSource.BUY_NOW, {
        productId: product.id,
        variantId: isCustomMode ? null : (selectedVariant?.id || null),
        quantity,
        isCustom: isCustomMode,
        customData: isCustomMode ? customData : undefined,
        color: selectedColor || undefined,
        product: {
          name: product.name,
          thumbnailUrl: product.images[0]?.url || "/products/mattress.webp",
        },
        variant: isCustomMode ? null : (selectedVariant ? {
          id: selectedVariant.id,
          salePrice: Number(selectedVariant.salePrice),
          mrp: Number(selectedVariant.mrp),
        } : null)
      } as any);

      router.push(routes.checkout);
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        toast.error("Please login to proceed to checkout");
        router.push(`${routes.login}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      } else {
        toast.error("Failed to proceed to checkout. Please try again.");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const price = isCustomMode 
    ? (customData?.calculatedPrice || 0)
    : roundPrice(Number(selectedVariant.salePrice));
  
  const mrp = isCustomMode
    ? price // Custom items don't have MRP discount currently
    : roundPrice(Number(selectedVariant.mrp));

  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
          {product.name}
        </h1>
        <div className="text-muted-foreground">
          <ul className="pl-0 space-y-1">
            {product.shortDescription.map((desc, i) => (
              <li key={i} className="text-sm flex flex-nowrap items-center gap-2">
                <span className="text-[#E53935] text-[10px]">■</span> <span>{desc}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-700">
            <span className="flex text-[#E53935]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </span>
            <span className="text-slate-500">|</span>
            <span>{reviewCount} Reviews</span>
          </div>
        </div>
      </div>

      {/* Pricing Inline */}
      <div className="flex items-center gap-4 pt-4 flex-wrap">
        <div className="text-3xl font-bold text-[#E53935]">
          ₹{formatPrice(price)}
        </div>
        {mrp > price && (
          <div className="text-lg text-slate-400 line-through">
            ₹{formatPrice(mrp)}
          </div>
        )}
        <div className="ml-auto bg-[#E53935] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
          Buy 1 Get 1 Free
        </div>
      </div>

      {/* Variant Selection */}
      {/* Variants (Modal) */}
      <div className="pt-4 space-y-4">
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-900">
              Colour: <span className="text-slate-600 font-normal">{getColorByValue(selectedColor || "")?.label}</span>
            </span>
            <div className="flex gap-2">
              {product.availableColors.map((colorValue) => {
                const color = getColorByValue(colorValue);
                const isSelected = selectedColor === colorValue;
                return (
                  <button
                    key={colorValue}
                    onClick={() => setSelectedColor(colorValue)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all border border-slate-200",
                      color.tailwindClass,
                      isSelected ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "hover:scale-110"
                    )}
                    title={color.label}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-900 min-w-[80px]">Select Size:</span>
          {product.type === "MATTRESS" ? (
            <MattressVariantSelector
              product={product}
              variants={sortedVariants as ProductVariantWithDetails[]}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
              quantity={quantity}
              setQuantity={setQuantity}
              isCustomMode={isCustomMode}
              setIsCustomMode={setIsCustomMode}
              setCustomData={setCustomData}
              customData={customData}
            />
          ) : product.type === "SOFA" ? (
            <SofaVariantSelector
              variants={sortedVariants as ProductVariantWithDetails[]}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          ) : null}
        </div>
      </div>

      {/* Purchase Actions */}
      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-4 items-center">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-900">Quantity:</span>
          <div className="flex items-center border border-input rounded-md overflow-hidden bg-white">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 hover:bg-slate-50 transition-colors text-[#E53935]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center h-10 w-12 text-sm font-medium">
              {quantity}
            </div>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="p-2 hover:bg-slate-50 transition-colors text-[#E53935]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            className="flex-1 h-12 bg-[#E53935] hover:bg-red-700 text-white shadow-md"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow || (isCustomMode && !customData?.isValid)}
          >
            {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
