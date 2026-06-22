import { getDynamicFilterFacets } from "@/actions/filters";
import { getProducts } from "@/actions/products";
import { parseProductFilters } from "@/lib/filters/parsers";
import { ProductType } from "@/app/generated/prisma/client";
import ProductsPageClientWrapper from "./products-client-wrapper";

import { Metadata } from "next";

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: "Products | Doctor Mattresses",
  description: "Browse our collection of premium orthopedic mattresses, sofas, and more.",
  alternates: {
    canonical: "https://doctormattresses.com/products",
  },
};
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function ProductsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const typeParam = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const type = typeParam === "MATTRESS" ? ProductType.MATTRESS : typeParam === "SOFA" ? ProductType.SOFA : undefined;

  // Replicate what the client does: Object.fromEntries(useSearchParams().entries())
  const searchParamsEntries: [string, string][] = [];
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) {
      v.forEach(val => searchParamsEntries.push([k, val]));
    } else if (v !== undefined) {
      searchParamsEntries.push([k, String(v)]);
    }
  }
  const searchParamsObj = Object.fromEntries(new URLSearchParams(searchParamsEntries).entries());

  const filters = parseProductFilters(searchParams as Record<string, string | string[] | undefined>);
  
  const queryClient = new QueryClient();

  const [dynamicFacets] = await Promise.all([
    getDynamicFilterFacets(type),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["products", searchParamsObj], // Must match client exactly!
      queryFn: async ({ pageParam }) => {
        return getProducts({ ...filters, cursor: pageParam as string | undefined, limit: 12 });
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes to prevent immediate refetch
    }),
  ]);

  return (
    <main className="min-h-screen bg-background font-montserrat">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsPageClientWrapper dynamicFacets={dynamicFacets} />
      </HydrationBoundary>
    </main>
  );
}