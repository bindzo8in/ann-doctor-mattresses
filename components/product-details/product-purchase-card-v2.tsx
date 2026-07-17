"use client";

import { useState } from "react";
import { ProductDetails, ProductVariantWithDetails } from "@/types/product-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Minus, Plus, Heart, BadgeCheck, Star, StarHalf, MapPin, CheckCircle2Icon } from "lucide-react";
import { MattressVariantSelector } from "./variants/mattress-variant-selector";
import { SofaVariantSelector } from "./variants/sofa-variant-selector";
import { CustomSizeSelector } from "./variants/custom-size-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { BranchesSection } from "@/components/home/branches-section";
import type { HomeBranchGroup } from "@/lib/home";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { formatPrice, roundPrice } from "@/lib/price";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { useCheckoutStore } from "@/hooks/use-checkout";
import { CheckoutSource } from "@/app/generated/prisma/enums";
import { useWishlist } from "@/hooks/use-wishlist";
import { getColorByValue } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductDetails;
  branchGroups?: HomeBranchGroup[];
}

export function ProductPurchaseCardV2({ product, branchGroups }: Props) {
  const sortedVariants = [...product.variants].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const isDefaultCustom = sortedVariants[0]?.mattressVariant?.sizeName === "CUSTOM";

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithDetails>(
    sortedVariants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isCustomMode, setIsCustomMode] = useState(isDefaultCustom);
  const [customData, setCustomData] = useState<{
    width: number;
    length: number;
    thickness: number;
    calculatedPrice: number;
    isValid: boolean;
  } | null>(() => {
     if (isDefaultCustom) {
        const t = sortedVariants[0]?.mattressVariant?.thickness || 6;
        const w = product.minWidth || 30;
        const l = product.minLength || 70;
        const areaSqFt = (w * l) / 144;
        const rate = ((product.customSizePricing as Record<string, number>) || {})[t.toString()] || 0;
        return {
           width: w,
           length: l,
           thickness: t,
           calculatedPrice: Math.round(areaSqFt * rate),
           isValid: true
        };
     }
     return null;
  });

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : null
  );

  const { addToCart, isAddingToCart } = useCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const actualReviewCount = product.reviews?.length || 0;
  const reviewCount = actualReviewCount;
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
    if (status === "unauthenticated") {
      toast.error("Please login to proceed to checkout");
      router.push(`${routes.login}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

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
    <div className="flex flex-col gap-6 font-montserrat">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
          {product.name}
        </h1>
        <div className="text-muted-foreground">
          <ul className="pl-0 space-y-1">
            {product.shortDescription.map((desc, i) => (
              <li key={i} className="text-sm flex flex-nowrap items-center gap-2">
                <span className="text-[#E53935] text-[10px]"><CheckCircle2Icon className="size-2"/></span> <span>{desc}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-700">
            <span className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </span>
            <span className="text-slate-500">|</span>
            <span className="border-2 border-green-800 rounded-l-2xl rounded-r-2xl bg-green-300/40 text-green-800 px-2 py-0.5">{averageRating}/5 ({reviewCount})</span>
          </div>
        </div>
      </div>

            {/* Variants (Modal) */}
      <div className="pt-4 space-y-4">
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-bold text-slate-900 shrink-0">
              Colour: <span className="text-slate-600 font-normal">{getColorByValue(selectedColor || "")?.label}</span>
            </span>
            <div className="flex flex-wrap gap-2">
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
          <span className="text-sm font-bold text-slate-900 shrink-0 sm:min-w-[80px]">Select Size:</span>
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
            variant="outline"
            className="flex-1 h-12 border-[#E53935] text-[#E53935] hover:bg-red-50 shadow-sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow || (isCustomMode && !customData?.isValid)}
          >
            {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            Add to Cart
          </Button>
          <Button
            size="lg"
            className="flex-1 h-12 bg-[#E53935] hover:bg-red-700 text-white shadow-md"
            onClick={handleBuyNow}
            disabled={isAddingToCart || isBuyingNow || (isCustomMode && !customData?.isValid)}
          >
            {isBuyingNow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Buy Now
          </Button>
        </div>
      </div>

      {/* Visit Store Action */}
      <div className="mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-12 text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold tracking-wide"
            >
              <MapPin className="mr-2 h-5 w-5 text-[#E53935]" />
              Visit Nearby Store
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 border-none bg-transparent overflow-hidden sm:rounded-[30px] w-[95vw] max-w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[90vh]">
            <DialogTitle className="sr-only">Our Branches</DialogTitle>
            <div className="overflow-y-auto max-h-[90vh] no-scrollbar rounded-[20px] sm:rounded-[30px] bg-[#005814]">
              {branchGroups ? <BranchesSection branchGroups={branchGroups} /> : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
