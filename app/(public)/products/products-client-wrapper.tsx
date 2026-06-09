"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ProductsPageClient } from "./products-client";

interface ProductsPageClientWrapperProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
  };
}

export default function ProductsPageClientWrapper({ dynamicFacets }: ProductsPageClientWrapperProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProductsPageClient dynamicFacets={dynamicFacets} />
    </QueryClientProvider>
  );
}
