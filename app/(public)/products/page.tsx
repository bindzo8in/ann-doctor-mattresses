import { getDynamicFilterFacets } from "@/actions/filters";
import { ProductType } from "@/app/generated/prisma/client";
import ProductsPageClientWrapper from "./products-client-wrapper";

export const dynamic = "force-dynamic";

export default async function ProductsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const typeParam = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const type = typeParam === "MATTRESS" ? ProductType.MATTRESS : typeParam === "SOFA" ? ProductType.SOFA : undefined;

  const dynamicFacets = await getDynamicFilterFacets(type);

  return (
    <main className="min-h-screen bg-background">
      <ProductsPageClientWrapper dynamicFacets={dynamicFacets} />
    </main>
  );
}