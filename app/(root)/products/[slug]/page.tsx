import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getRelatedProducts } from "@/actions/product-details";
import { getActiveBranchesGroupedByState } from "@/lib/home";
import { ProductGallery } from "@/components/product-details/product-gallery";
import { ProductPurchaseCardV2 } from "@/components/product-details/product-purchase-card-v2";
import { SpecificationTableV2 } from "@/components/product-details/specification-table-v2";
import { ProductSectionsRenderer } from "@/components/product-details/product-sections-renderer";
import { FaqAccordionV2 } from "@/components/product-details/faq-accordion-v2";
import { RelatedProductsCarousel } from "@/components/product-details/related-products-carousel";
import { ProductReviews } from "@/components/product-details/product-reviews";
import { getApprovedReviews, canUserReviewProduct } from "@/actions/reviews";

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
    alternates: {
      canonical: `https://doctormattresses.com/products/${product.slug}`,
    },
  };
}


import { MobileBackButton } from "@/components/product-details/mobile-back-button";

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, reviewsRes, canReviewRes, branchGroups] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getApprovedReviews(product.id),
    canUserReviewProduct(product.id),
    getActiveBranchesGroupedByState()
  ]);

  const initialReviews = reviewsRes.success && reviewsRes.reviews ? reviewsRes.reviews : [];
  const initialCanReview = canReviewRes;


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
    <div className="bg-background min-h-screen font-montserrat">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MobileBackButton />
        {/* Top Section: Purchase Card (Left) & Gallery (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 px-4 md:px-8 lg:px-12 xl:px-20">
          <div className="w-full order-2 lg:order-1">
            <ProductPurchaseCardV2 product={product} branchGroups={branchGroups} />
          </div>
          <div className="w-full order-1 lg:order-2">
            <ProductGallery images={product.images} />
          </div>
        </div>

        <Separator className="my-12" />

        {/* Product Details Section */}
        <div className="space-y-16">
          {product.specifications.length > 0 && (
            <div id="specifications" className="max-w-6xl mx-auto">
              <SpecificationTableV2 specifications={product.specifications} />
            </div>
          )}
          
          <div className="max-w-6xl mx-auto">
            <ProductSectionsRenderer sections={product.sections} sectionHeading={product.sectionHeading} />
          </div>
        </div>
          {/* similar products */}
          
        {/* FAQs Section */}
        {product.faqs.length > 0 && (
          <div className="py-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-12 flex flex-col items-center justify-center">
              FAQs
              <div className="w-16 h-1 bg-red-600 mt-2 rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <FaqAccordionV2 faqs={product.faqs} />
              </div>
              <div className="hidden md:flex justify-center items-center">
                <div className="relative w-80 h-80 flex items-center justify-center">
                   <Image src="/faq.png" alt="FAQ" fill className="object-contain drop-shadow-xl" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Reviews */}
        <Separator className="my-12" />
        <div id="reviews" className="max-w-4xl mx-auto scroll-mt-24">
          <ProductReviews productId={product.id} initialReviews={initialReviews} initialCanReview={initialCanReview} />
        </div>


        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <Separator className="my-12" />
            <div className="px-4 md:px-8 lg:px-12 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-6">You May Also Like</h2>
              <RelatedProductsCarousel products={relatedProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
