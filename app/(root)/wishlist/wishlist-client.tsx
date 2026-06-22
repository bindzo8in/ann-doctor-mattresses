"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

interface WishlistPageClientProps {
  initialItems: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      thumbnailUrl?: string | null;
      variants: { isDefault: boolean, mrp: number | string, salePrice: number | string }[];
      [key: string]: unknown;
    }
  }[];
  initialIsAuthenticated: boolean;
}


export function WishlistPageClient({ initialItems, initialIsAuthenticated }: WishlistPageClientProps) {
  const { wishlistItems, isLoading, isAuthenticated: storeIsAuthenticated, hasLoaded } = useWishlist();
  const router = useRouter();

  // Use store data if loaded, otherwise fallback to server initial data
  const displayItems = hasLoaded ? wishlistItems : initialItems;
  const isAuth = hasLoaded ? storeIsAuthenticated : initialIsAuthenticated;
  const showLoading = isLoading && !hasLoaded;

  if (showLoading && displayItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <LogIn className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to view wishlist</h1>
          <p className="text-slate-500">
            Keep track of your favorite mattresses and sofas by signing in to your account.
          </p>
        </div>
        <Button 
          onClick={() => router.push(`${routes.login}?callbackUrl=${encodeURIComponent("/wishlist")}`)}
          className="w-full"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h1>
          <p className="text-slate-500">
            Explore our premium orthopedic mattresses and custom sofas to add them to your wishlist.
          </p>
        </div>
        <Button 
          onClick={() => router.push(routes.products)}
          className="w-full"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-8 h-8 fill-destructive text-destructive" />
          My Wishlist
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          You have {displayItems.length} {displayItems.length === 1 ? "item" : "items"} in your wishlist.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => {
          const product = item.product;
          // Calculate default variant price or cheapest variant price
          const defaultVariant = product.variants.find((v: { isDefault: boolean, mrp: number | string, salePrice: number | string }) => v.isDefault) || product.variants[0];
          const price = defaultVariant ? Number(defaultVariant.salePrice) : 0;

          const compareAtPrice = defaultVariant && Number(defaultVariant.mrp) > Number(defaultVariant.salePrice) 
            ? Number(defaultVariant.mrp) 
            : undefined;

          return (
            <ProductCard
              key={item.id}
              id={product.id}
              name={product.name}
              image={item.product.thumbnailUrl || "/products/mattress.webp"}
              price={price}
              compareAtPrice={compareAtPrice}
              rating={5}
              features={[]}
              slug={product.slug}
              productData={product as unknown as Record<string, unknown>}
            />
          );
        })}
      </div>
    </div>
  );
}
