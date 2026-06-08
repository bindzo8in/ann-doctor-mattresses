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

interface Props {
  product: ProductDetails;
}

export function ProductPurchaseCard({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithDetails>(
    product.variants.find((v) => v.isDefault) || product.variants[0]
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
        } as any);
      } else {
        await addToCart({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity,
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
          <ul className="pl-5 space-y-1">
            {product.shortDescription.map((desc, i) => (
              <li key={i} className="text-sm flex flex-nowrap items-center gap-1"><BadgeCheck className="w-4 h-4 text-primary-foreground fill-primary" /> <span>{desc}</span></li>
            ))}
          </ul>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center text-amber-500 gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const isFullStar = i < Math.floor(averageRating);
                const isHalfStar = i === Math.floor(averageRating) && averageRating % 1 !== 0;
                
                if (isHalfStar) {
                  return <StarHalf key={i} className="w-8 h-8 fill-amber-400 text-amber-400" />;
                }
                
                return <Star key={i} className={`w-8 h-8 ${isFullStar ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />;
              })}
            </div>
            <div className="px-3 py-1 rounded-full border-2 border-green-600 text-green-700 font-bold bg-green-50 text-base flex items-center">
              {averageRating.toFixed(1).replace('.0', '')}/5 <span className="font-normal ml-1">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-end gap-3 pb-6 border-b border-border">
        <span className="text-3xl font-bold tracking-tight">₹{formatPrice(price)}</span>
        {mrp > price && (
          <>
            <span className="text-lg text-muted-foreground line-through mb-1">
              ₹{formatPrice(mrp)}
            </span>
            <Badge variant="destructive" className="mb-2">Save {discount}%</Badge>
          </>
        )}
      </div>

      {/* Variant Selection */}
      <div className="py-2">
        {product.type === "MATTRESS" ? (
          <MattressVariantSelector
            product={product}
            variants={product.variants as ProductVariantWithDetails[]}
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
            variants={product.variants as ProductVariantWithDetails[]}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />
        ) : null}
      </div>

      {/* Purchase Actions */}
      <div className="mt-4 pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border border-input rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-none"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center h-12 w-12 text-sm font-medium">
            {quantity}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-none"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex gap-3">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-12"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow}
          >
            {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
          <Button
            size="lg"
            className="flex-1 h-12"
            onClick={handleBuyNow}
            disabled={isAddingToCart || isBuyingNow}
          >
            {isBuyingNow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isBuyingNow ? "Processing..." : "Buy Now"}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 shrink-0"
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-5 w-5 ${currentIsWishlisted ? "fill-destructive text-destructive" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
