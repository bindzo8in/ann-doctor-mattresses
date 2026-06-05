import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/actions/product-details";
import { ProductGallery } from "@/components/product-details/product-gallery";
import { ProductPurchaseCard } from "@/components/product-details/product-purchase-card";
import { SpecificationTable } from "@/components/product-details/specification-table";
import { ProductSectionsRenderer } from "@/components/product-details/product-sections-renderer";
import { FaqAccordion } from "@/components/product-details/faq-accordion";
import { RelatedProductsCarousel } from "@/components/product-details/related-products-carousel";
import { MattressRecommendationSection } from "@/components/product-details/mattress-recommendation-section";
import { Separator } from "@/components/ui/separator";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Ann Doctor Mattresses`,
    description: product.shortDescription[0] || product.name,
    openGraph: {
      images: [{ url: product.thumbnailUrl }],
    },
    twitter: {
      card: "summary_large_image",
      images: [product.thumbnailUrl],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.shortDescription.join(" "),
    brand: "Ann Doctor Mattress",
    offers: {
      "@type": "AggregateOffer",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${product.slug}`,
      priceCurrency: "INR",
      lowPrice: product.variants[0]?.salePrice,
      highPrice: product.variants[product.variants.length - 1]?.salePrice,
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Gallery & Purchase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          <div className="w-full">
            <ProductGallery images={product.images} />
          </div>
          <div className="w-full">
            <ProductPurchaseCard product={product} />
          </div>
        </div>

        <Separator className="my-12" />

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area (Sections & Specs) */}
          <div className="lg:col-span-2 space-y-12">
            <ProductSectionsRenderer sections={product.sections} />
            
            {product.specifications.length > 0 && (
              <div id="specifications">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Specifications</h2>
                <SpecificationTable specifications={product.specifications} />
              </div>
            )}
          </div>
          
          {/* Sidebar Area (Recommendations & Highlights) */}
          <div className="space-y-8">
            {product.type === "MATTRESS" && (
              <MattressRecommendationSection product={product} />
            )}
          </div>
        </div>

        {/* FAQs Section */}
        {product.faqs.length > 0 && (
          <>
            <Separator className="my-12" />
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">Frequently Asked Questions</h2>
              <FaqAccordion faqs={product.faqs} />
            </div>
          </>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <Separator className="my-12" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">You May Also Like</h2>
              <RelatedProductsCarousel products={relatedProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
