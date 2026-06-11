"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductsPageClient } from "./products-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface ProductsPageClientWrapperProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
  };
  initialProducts: {
    products: any[];
    nextCursor?: string;
  };
}

export default function ProductsPageClientWrapper({ dynamicFacets, initialProducts }: ProductsPageClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ProductsPageClient dynamicFacets={dynamicFacets} initialProducts={initialProducts} />
    </QueryClientProvider>
  );

}
