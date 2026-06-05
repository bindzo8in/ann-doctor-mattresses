import { Suspense } from "react";
import HomeHeroSection from "@/components/home/hero-section";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { WhyChooseUsSection } from "@/components/home/why-choose-us-section";
import { getFeaturedProducts, getNewLaunches, getCategories } from "@/lib/home";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton for product grids
function ProductGridSkeleton() {
  return (
    <div className="py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function BestSellersSection() {
  const products = await getFeaturedProducts(8);
  return (
    <ProductGridSection
      badge="Best Sellers"
      title="Our Most Loved Products"
      subtitle="Top-rated mattresses and sofas chosen by thousands of happy customers."
      products={products}
      viewAllHref="/products?featured=true"
      viewAllLabel="View All Best Sellers"
    />
  );
}

async function NewLaunchesSection() {
  const products = await getNewLaunches(8);
  return (
    <ProductGridSection
      badge="New Launches"
      title="Just Arrived"
      subtitle="Fresh additions to our collection — be the first to experience them."
      products={products}
      viewAllHref="/products"
      viewAllLabel="View All Products"
    />
  );
}

async function CategoriesData() {
  const categories = await getCategories();
  return <CategoriesSection categories={categories} />;
}

export default async function Home() {
  return (
    <main>
      {/* Hero */}
      <HomeHeroSection />

      {/* Categories */}
      <Suspense
        fallback={
          <div className="py-16 bg-muted/40">
            <div className="container mx-auto px-6 md:px-12">
              <div className="text-center mb-10 space-y-3">
                <Skeleton className="h-3 w-32 mx-auto" />
                <Skeleton className="h-9 w-64 mx-auto" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <CategoriesData />
      </Suspense>

      {/* Best Sellers */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <BestSellersSection />
      </Suspense>

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* New Launches */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <NewLaunchesSection />
      </Suspense>
    </main>
  );
}
