"use client";

import React from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Heart, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function WishlistPage() {
  const { wishlistItems, isLoading, isAuthenticated } = useWishlist();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
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

  if (wishlistItems.length === 0) {
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
          You have {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} in your wishlist.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          // Calculate default variant price or cheapest variant price
          const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
          const price = defaultVariant ? Number(defaultVariant.salePrice) : 0;
          const compareAtPrice = defaultVariant && Number(defaultVariant.mrp) > Number(defaultVariant.salePrice) 
            ? Number(defaultVariant.mrp) 
            : undefined;

          return (
            <ProductCard
              key={item.id}
              id={product.id}
              name={product.name}
              image={product.thumbnailUrl || "/products/mattress.webp"}
              price={price}
              compareAtPrice={compareAtPrice}
              rating={5}
              features={[]}
              slug={product.slug}
            />
          );
        })}
      </div>
    </div>
  );
}
