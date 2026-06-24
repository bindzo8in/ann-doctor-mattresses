"use client";

import { ProductsPageClient } from "./products-client";

interface ProductsPageClientWrapperProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
    maxPrice: number;
  };
}

export default function ProductsPageClientWrapper({ dynamicFacets }: ProductsPageClientWrapperProps) {
  return <ProductsPageClient dynamicFacets={dynamicFacets} />;
}
