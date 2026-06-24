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
import {
  FIRMNESS_OPTIONS,
  COMFORT_LEVEL_OPTIONS,
  HEALTH_BENEFIT_OPTIONS,
  SLEEPING_POSITION_OPTIONS,
} from "@/components/forms/product/constants";

interface ProductsPageClientProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
    maxPrice: number;
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

  const searchParamsObj = Object.fromEntries(searchParams.entries());
  const filters = parseProductFilters(searchParamsObj);

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
      return getProducts({ ...filters, cursor: pageParam as string | undefined, limit: 12 });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Combine dictionaries for ActiveFiltersBar
  const dictionaries = {
    category: dynamicFacets.categoryOptions,
    size: MATTRESS_SIZE_OPTIONS,
    thickness: dynamicFacets.thicknessOptions,
    firmness: FIRMNESS_OPTIONS,
    comfortLevel: COMFORT_LEVEL_OPTIONS,
    healthBenefits: HEALTH_BENEFIT_OPTIONS,
    sleepingPosition: SLEEPING_POSITION_OPTIONS,
    seatingCapacity: dynamicFacets.seatingCapacityOptions,
    material: dynamicFacets.materialOptions,
    shape: dynamicFacets.shapeOptions,
  };

  return (
    <div className="flex flex-col">

      <ActiveFiltersBar dictionaries={dictionaries} />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFiltersSidebar dynamicFacets={dynamicFacets} />
          
          <div className="flex-1">
            {status === "pending" || !data ? (
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
                          const defaultVariant = product.variants.find((v: { isDefault: boolean, mrp: number | string, salePrice: number | string }) => v.isDefault) || product.variants[0];
                          
                          // Find a variant that matches the price filters (if applied)
                          let displayVariant = defaultVariant;
                          if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                            const matchedVariant = product.variants.find((v: { isDefault: boolean, mrp: number | string, salePrice: number | string }) => {
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

                          const reviews = (product as any).reviews || [];
                          const actualReviewCount = reviews.length;
                          const reviewCount = actualReviewCount > 0 ? actualReviewCount : 100;
                          const rating = actualReviewCount > 0 
                            ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / actualReviewCount
                            : 5;

                          return (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              image={product.images[0]?.url || "/products/mattress.webp"}
                              price={price}
                              compareAtPrice={compareAtPrice}
                              rating={rating}
                              reviewCount={reviewCount}
                              features={product.shortDescription}
                              slug={product.slug}
                              productData={product as unknown as Record<string, unknown>}
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
