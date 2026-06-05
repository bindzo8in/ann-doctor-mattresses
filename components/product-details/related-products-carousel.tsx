"use client";

import { RelatedProduct } from "@/types/product-details";
import { ProductCard } from "@/components/products/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
interface Props {
  products: RelatedProduct[];
}

export function RelatedProductsCarousel({ products }: Props) {
  if (!products?.length) return null;

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => {
            const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
            const price = defaultVariant ? Number(defaultVariant.salePrice) : 0;
            const compareAtPrice = defaultVariant && Number(defaultVariant.mrp) > Number(defaultVariant.salePrice) 
              ? Number(defaultVariant.mrp) 
              : undefined;

            return (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  image={product.images[0]?.url || "/products/mattress.webp"}
                  price={price}
                  compareAtPrice={compareAtPrice}
                  rating={5}
                  features={product.shortDescription}
                  slug={product.slug}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {products.length > 4 && (
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        )}
      </Carousel>
    </div>
  );
}
