"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "@/components/products/product-card";
import { getProducts } from "@/actions/products";
import { Loader2 } from "lucide-react";
import { ProductFiltersSidebar } from "@/components/filters/product-filters-sidebar";
import { ActiveFiltersBar } from "@/components/filters/active-filters-bar";
import { useProductFilters } from "@/lib/filters/use-product-filters";
import { parseProductFilters } from "@/lib/filters/parsers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { routes } from "@/lib/routes";
import {
  FIRMNESS_OPTIONS,
  COMFORT_LEVEL_OPTIONS,
  HEALTH_BENEFIT_OPTIONS,
  SLEEPING_POSITION_OPTIONS,
  AGE_GROUP_OPTIONS,
  WEIGHT_GROUP_OPTIONS,
} from "@/components/forms/product/constants";

interface ProductsPageClientProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
  };
}

const MATTRESS_SIZE_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "QUEEN", label: "Queen" },
  { value: "KING", label: "King" },
  { value: "CUSTOM", label: "Custom" },
];

export function ProductsPageClient({ dynamicFacets }: ProductsPageClientProps) {
  const { searchParams } = useProductFilters();
  const { ref, inView } = useInView();
  const router = useRouter();

  const searchParamsObj = Object.fromEntries(searchParams.entries());
  const filters = parseProductFilters(searchParamsObj);
  const currentType = filters.type;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["products", searchParamsObj],
    queryFn: async ({ pageParam }) => {
      return getProducts({ ...filters, cursor: pageParam, limit: 12 });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Combine dictionaries for ActiveFiltersBar
  const dictionaries = {
    size: MATTRESS_SIZE_OPTIONS,
    thickness: dynamicFacets.thicknessOptions,
    firmness: FIRMNESS_OPTIONS,
    comfortLevel: COMFORT_LEVEL_OPTIONS,
    healthBenefits: HEALTH_BENEFIT_OPTIONS,
    sleepingPosition: SLEEPING_POSITION_OPTIONS,
    ageGroup: AGE_GROUP_OPTIONS,
    weightGroup: WEIGHT_GROUP_OPTIONS,
    seatingCapacity: dynamicFacets.seatingCapacityOptions,
    material: dynamicFacets.materialOptions,
    shape: dynamicFacets.shapeOptions,
  };

  return (
    <div className="flex flex-col">

      <ActiveFiltersBar dictionaries={dictionaries} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFiltersSidebar dynamicFacets={dynamicFacets} />
          
          <div className="flex-1">
            {status === "pending" ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : status === "error" ? (
              <div className="flex h-64 flex-col items-center justify-center text-destructive">
                <p>Error loading products.</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {data.pages[0].products.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground bg-card border border-border rounded-lg shadow-sm">
                    No products found matching your criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6 xl:gap-8">
                    {data.pages.map((page, i) => (
                      <div key={i} className="contents">
                        {page.products.map((product) => {
                          const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
                          
                          // Find a variant that matches the price filters (if applied)
                          let displayVariant = defaultVariant;
                          if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                            const matchedVariant = product.variants.find(v => {
                              const vPrice = Number(v.salePrice);
                              if (filters.priceMin !== undefined && vPrice < filters.priceMin) return false;
                              if (filters.priceMax !== undefined && vPrice > filters.priceMax) return false;
                              return true;
                            });
                            if (matchedVariant) {
                              displayVariant = matchedVariant;
                            }
                          }

                          const price = displayVariant ? Number(displayVariant.salePrice) : 0;
                          const compareAtPrice = displayVariant && Number(displayVariant.mrp) > Number(displayVariant.salePrice) 
                            ? Number(displayVariant.mrp) 
                            : undefined;

                          return (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              image={product.images[0]?.url || "/products/mattress.webp"}
                              badge="Buy 1 Get 1 Free"
                              price={price}
                              compareAtPrice={compareAtPrice}
                              rating={5}
                              reviewCount={0}
                              features={product.shortDescription}
                              slug={product.slug}
                              productData={product as any}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div ref={ref} className="h-10 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
