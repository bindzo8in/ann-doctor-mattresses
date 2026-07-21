"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  images: { id?: string; url: string }[];
  fallbackThumbnail?: string;
}

export function ProductImageModal({
  isOpen,
  onClose,
  productName,
  images,
  fallbackThumbnail,
}: Props) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  // Combine images array or use fallbackThumbnail if images array is empty
  const displayImages = React.useMemo(() => {
    if (images && images.length > 0) return images;
    if (fallbackThumbnail) return [{ id: "fallback", url: fallbackThumbnail }];
    return [];
  }, [images, fallbackThumbnail]);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-6 bg-white overflow-hidden">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold text-slate-800 truncate max-w-[450px]">
              {productName}
            </DialogTitle>
            {displayImages.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {current + 1} / {displayImages.length}
              </span>
            )}
          </div>
        </DialogHeader>

        {displayImages.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 text-sm">
            No images available for this product
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {/* Main Carousel */}
            <div className="relative group px-1">
              <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                  {displayImages.map((img, idx) => (
                    <CarouselItem key={img.id || idx}>
                      <div className="relative w-full aspect-[4/3] max-h-[450px] overflow-hidden rounded-xl bg-slate-950/5 border border-slate-200 flex items-center justify-center">
                        <Image
                          src={img.url}
                          alt={`${productName} - Image ${idx + 1}`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, 700px"
                          priority={idx === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {displayImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 bg-white/80 hover:bg-white text-slate-800 border-slate-300 shadow-md" />
                    <CarouselNext className="right-3 bg-white/80 hover:bg-white text-slate-800 border-slate-300 shadow-md" />
                  </>
                )}
              </Carousel>
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 justify-center max-w-full">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => api?.scrollTo(idx)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none",
                      current === idx
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
