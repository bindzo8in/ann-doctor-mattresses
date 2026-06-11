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
export default async function ProductsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const typeParam = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const type = typeParam === "MATTRESS" ? ProductType.MATTRESS : typeParam === "SOFA" ? ProductType.SOFA : undefined;

  const filters = parseProductFilters(searchParams as Record<string, string | string[] | undefined>);
  const [dynamicFacets, initialProducts] = await Promise.all([
    getDynamicFilterFacets(type),
    getProducts({ ...filters, limit: 12 }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <ProductsPageClientWrapper dynamicFacets={dynamicFacets} initialProducts={initialProducts} />
    </main>
  );

}