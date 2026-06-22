import { notFound } from "next/navigation";
import { CategoryFeatureBlock } from "@/components/category/category-feature-block";
import { CategoryVariantsBlock } from "@/components/category/category-variants-block";
import { Metadata } from "next";
import { VariantStack } from "./variant";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileVariantStack } from "./MobileVariantStack";
import prisma from "@/lib/prisma";
import { ProductGridSection } from "@/components/home/product-grid-section";
import type { HomeProduct } from "@/lib/home";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} | Ann Doctor Mattresses`,
    description: category.description || `Explore our ${category.name} collection.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          category: true,
          variants: { orderBy: { salePrice: "asc" }, take: 1 },
        }
      }
    }
  });

  if (!category) {
    notFound();
  }

  const features = Array.isArray(category.features) ? category.features : [];
  const layerImageUrl = category.layerImageUrl || "/cat_mattress.png"; // Fallback placeholder
  const coverImageUrl = category.coverImageUrl || "/cat_mattress.png"; // Fallback placeholder

  const variants = category.products.map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.thumbnailUrl || "/cat_mattress.png",
    colorHex: "#f0d5d5", // Provide default for the interface requirement, but it's ignored by VariantStack
    link: `/products/${product.slug}`
  }));

  const gridProducts: HomeProduct[] = category.products.slice(0, 4).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnailUrl: p.thumbnailUrl,
    shortDescription: (p as any).shortDescription || [],
    isFeatured: (p as any).isFeatured || false,
    createdAt: (p as any).createdAt || new Date(),
    category: p.category,
    variants: (p.variants || []).map((v) => ({
      id: v.id,
      mrp: Number(v.mrp),
      salePrice: Number(v.salePrice),
      isDefault: v.isDefault,
    })),
  }));

  return (
    <main className="min-h-screen bg-[url('/bg-category.jpg')] bg-cover bg-no-repeat pt-0">
      {/* Category Navbar */}
      <div className="w-full bg-[#E51D2A] text-white py-3 md:py-4 px-2 md:px-6 sticky top-0 z-50 shadow-md">
        <div className="page-container flex items-center">
          <Link href="/products" className="mr-4 flex items-center justify-center p-2 hover:bg-white/10 rounded-full transition-colors group">
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 font-light text-white group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-montserrat-alternates font-light tracking-wide mt-1">
            {category.name}
          </h1>
        </div>
      </div>

      {/* Top Section: Features & Layers */}
      <CategoryFeatureBlock
        features={features as any}
        layerImageUrl={layerImageUrl}
        layerVideoUrl={category.layerVideoUrl}
      />

<section className="relative overflow-hidden section-padding lg:min-h-screen">
  {/* Desktop Decoration */}
  <div className="absolute right-[-250px] top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 rounded-full opacity-20 bg-[url('/services.webp')] lg:block" />

  <div className="container mx-auto px-4 md:px-6 lg:px-8">
    <div className="flex flex-col items-center gap-12 lg:min-h-screen lg:flex-row">

      {/* Left Side */}
      <div className="flex w-full justify-center lg:flex-1 lg:justify-start">
        <div className="w-full max-w-[320px]">
          <h2 className="mb-6 text-center text-3xl font-semibold text-red-500 lg:text-left lg:text-5xl">
            {category.name}
          </h2>

          <div className="overflow-hidden rounded-[32px] lg:rounded-[40px]">
            <Image
              src={coverImageUrl}
              alt={category.name}
              width={320}
              height={450}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Desktop Stack */}
      <div className="hidden flex-1 justify-center lg:flex">
        {variants.length > 0 ? (
          <VariantStack variants={variants} />
        ) : (
          <div className="text-gray-500">No products available in this category yet.</div>
        )}
      </div>

      {/* Mobile & Tablet */}
      <div className="w-full lg:hidden">
        {variants.length > 0 ? (
          <MobileVariantStack variants={variants} />
        ) : (
          <div className="text-gray-500 text-center">No products available in this category yet.</div>
        )}
      </div>

    </div>
  </div>
</section>

      {/* Third Block: Top Products Grid */}
      <div className="bg-white">
        <ProductGridSection
          badge="Featured Collection"
          title={`More from ${category.name}`}
          subtitle={`Explore top-rated products in the ${category.name} category.`}
          products={gridProducts}
          viewAllHref={`/products?category=${category.slug}`}
          viewAllLabel="View All Products"
        />
      </div>

    </main>
  );
}


