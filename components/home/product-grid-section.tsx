"use client";

import { ProductCard } from "@/components/products/product-card";
import type { HomeProduct } from "@/lib/home";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  products: HomeProduct[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductGridSection({
  title,
  subtitle,
  badge,
  products,
  viewAllHref = "/products",
  viewAllLabel = "View All",
}: ProductGridSectionProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            {badge && (
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-destructive mb-2">
                {badge}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-lg">
                {subtitle}
              </p>
            )}
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-full">
            <Link href={viewAllHref} className="flex items-center gap-2">
              {viewAllLabel} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const defaultVariant =
              product.variants.find((v) => v.isDefault) ?? product.variants[0];
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.thumbnailUrl}
                price={defaultVariant?.salePrice ?? 0}
                compareAtPrice={
                  defaultVariant && defaultVariant.mrp > defaultVariant.salePrice
                    ? defaultVariant.mrp
                    : undefined
                }
                features={product.shortDescription.slice(0, 3)}
                slug={product.slug}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
