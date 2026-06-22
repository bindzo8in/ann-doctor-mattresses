"use client";

import * as React from "react";
import Image from "next/image";
import { ProductImage } from "@/app/generated/prisma/browser";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Props {
  images: ProductImage[];
}

export function ProductGallery({ images }: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images?.length) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">No Image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Carousel */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="relative w-full aspect-[4/3] max-h-[60vh] lg:max-h-[550px] overflow-hidden rounded-2xl bg-[#f8f9fa] border border-slate-100">
                <Image
                  src={image.url}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
                {index === 0 && (
                  <div className="absolute top-4 left-4 bg-[#E53935] text-white px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md uppercase tracking-wide shadow-md z-10">
                    Buy 1 Get 1 Free
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                current === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
