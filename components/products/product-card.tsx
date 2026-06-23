import Image from "next/image";
import Link from "next/link";
import { Heart, Star, StarHalf, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";
import { ShoppingCart, Zap } from "lucide-react";
import { QuickBuyModal } from "./quick-buy-modal";
import { ProductDetails } from "@/types/product-details";

export interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  features?: string[];
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  slug?: string;
  productData?: ProductDetails | any;
}

export function ProductCard({
  id,
  name,
  image,
  price,
  compareAtPrice,
  rating = 5,
  reviewCount,
  badge,
  features = [],
  isWishlisted,
  onWishlistToggle,
  slug,
  productData,
}: ProductCardProps) {
  const { wishlistItems, toggleWishlist, isAuthenticated } = useWishlist();

  const currentIsWishlisted = isWishlisted !== undefined 
    ? isWishlisted 
    : wishlistItems.some(item => item.productId === id);

  const handleWishlistClick = async () => {
    if (onWishlistToggle) {
      onWishlistToggle();
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    try {
      const added = await toggleWishlist(id);
      if (added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const innerContent = (
    <>
      {/* IMAGE */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted shrink-0">
        <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        {badge && (
          <div className="absolute right-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {badge}
          </div>
        )}
      </div>

      {/* CONTENT — grows to fill card height */}
      <CardContent className="flex flex-col flex-1 gap-3 p-4 sm:p-5">
        {/* Title + Wishlist */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-destructive leading-snug line-clamp-2">
            {name}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className="relative z-20 rounded-full shrink-0 -mt-1 -mr-1 size-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistClick();
            }}
          >
            <Heart
              className={`size-4 ${currentIsWishlisted ? "fill-destructive text-destructive" : ""}`}
            />
          </Button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex flex-wrap gap-0.5 items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              const isFullStar = i < Math.floor(rating);
              const isHalfStar = i === Math.floor(rating) && rating % 1 !== 0;
              
              if (isHalfStar) {
                return (
                  <StarHalf
                    key={i}
                    className="size-3.5 fill-yellow-400 text-yellow-400"
                  />
                );
              }
              
              return (
                <Star
                  key={i}
                  className={`size-3.5 ${
                    isFullStar
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              );
            })}
          </div>
          {reviewCount !== undefined && (
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg sm:text-xl font-bold text-destructive">
            ₹{formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Features — flex-1 pushes footer to bottom */}
        {features.length > 0 && (
          <ul className="flex-1 space-y-1.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-destructive" />
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </>
  );

  const innerCard = (
    <Card className="relative overflow-hidden rounded-2xl border p-0 flex flex-col h-full hover:shadow-md transition">
      {/* OVERLAY LINK */}
      {slug && (
        <Link href={`/products/${slug}`} className="absolute inset-0 z-10" aria-hidden="true" scroll>
          <span className="sr-only">View Details</span>
        </Link>
      )}

      <div className="flex flex-col flex-1">
        {innerContent}
      </div>

      {/* FOOTER — Quick Buy Actions */}
      <CardFooter className="relative z-20 p-4 sm:p-5 pt-0 gap-2">
        {productData ? (
          <>
            <QuickBuyModal
              product={productData}
              trigger={
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-10 w-10 shrink-0 text-slate-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              }
            />
            <QuickBuyModal
              product={productData}
              trigger={
                <Button 
                  className="flex-1 h-10 bg-[#E53935] hover:bg-red-700 font-bold"
                >
                  Buy Now
                </Button>
              }
            />
          </>
        ) : slug ? (
          <Button
            asChild
            className="w-full rounded-lg text-xs sm:text-sm h-9 sm:h-10 font-semibold"
          >
            <Link href={`/products/${slug}`} scroll>View Details</Link>
          </Button>
        ) : (
          <Button
            className="w-full rounded-lg text-xs sm:text-sm h-9 sm:h-10 font-semibold"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return innerCard;
}