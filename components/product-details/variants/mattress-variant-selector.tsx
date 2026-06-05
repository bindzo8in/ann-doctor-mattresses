"use client";

import { useMemo, useState } from "react";
import { ProductVariantWithDetails } from "@/types/product-details";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Props {
  variants: ProductVariantWithDetails[];
  selectedVariant: ProductVariantWithDetails;
  onSelect: (variant: ProductVariantWithDetails) => void;
}

export function MattressVariantSelector({ variants, selectedVariant, onSelect }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const currentMattress = selectedVariant.mattressVariant;
  if (!currentMattress) return null;

  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);

  // 1. Available Sizes
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    variants.forEach((v) => {
      if (v.mattressVariant) sizes.add(v.mattressVariant.sizeName);
    });
    return Array.from(sizes);
  }, [variants]);

  // 2. Available Dimensions for current size
  const availableDimensionsForSize = useMemo(() => {
    const dims = new Map<string, { length: number; width: number }>();
    variants.forEach((v) => {
      if (v.mattressVariant?.sizeName === currentMattress.sizeName) {
        const key = `${v.mattressVariant.length}x${v.mattressVariant.width}`;
        if (!dims.has(key)) {
          dims.set(key, { length: v.mattressVariant.length, width: v.mattressVariant.width });
        }
      }
    });
    return Array.from(dims.values());
  }, [variants, currentMattress.sizeName]);

  // 3. Available Thicknesses for current size + dimension
  const availableThicknesses = useMemo(() => {
    const thicknesses = new Set<number>();
    variants.forEach((v) => {
      if (
        v.mattressVariant?.sizeName === currentMattress.sizeName &&
        v.mattressVariant?.length === currentMattress.length &&
        v.mattressVariant?.width === currentMattress.width
      ) {
        thicknesses.add(v.mattressVariant.thickness);
      }
    });
    return Array.from(thicknesses).sort((a, b) => a - b);
  }, [variants, currentMattress]);

  // Handlers
  const handleSizeSelect = (sizeName: string) => {
    // Find the first variant with this size
    const newVariant = variants.find((v) => v.mattressVariant?.sizeName === sizeName);
    if (newVariant) onSelect(newVariant);
  };

  const handleDimensionSelect = (length: number, width: number) => {
    // Try to find same thickness first, else first available
    const newVariant = variants.find(
      (v) =>
        v.mattressVariant?.sizeName === currentMattress.sizeName &&
        v.mattressVariant?.length === length &&
        v.mattressVariant?.width === width &&
        v.mattressVariant?.thickness === currentMattress.thickness
    ) || variants.find(
      (v) =>
        v.mattressVariant?.sizeName === currentMattress.sizeName &&
        v.mattressVariant?.length === length &&
        v.mattressVariant?.width === width
    );
    
    if (newVariant) {
      onSelect(newVariant);
      setDimensionDialogOpen(false);
    }
  };

  const handleThicknessSelect = (thickness: number) => {
    const newVariant = variants.find(
      (v) =>
        v.mattressVariant?.sizeName === currentMattress.sizeName &&
        v.mattressVariant?.length === currentMattress.length &&
        v.mattressVariant?.width === currentMattress.width &&
        v.mattressVariant?.thickness === thickness
    );
    if (newVariant) onSelect(newVariant);
  };

  const currentDimensionLabel = `${currentMattress.length}" L × ${currentMattress.width}" W`;

  const DimensionList = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
      {availableDimensionsForSize.map((dim) => {
        const isSelected =
          dim.length === currentMattress.length && dim.width === currentMattress.width;
        return (
          <Button
            key={`${dim.length}x${dim.width}`}
            variant={isSelected ? "default" : "outline"}
            className={cn("h-12 font-medium", isSelected && "border-primary")}
            onClick={() => handleDimensionSelect(dim.length, dim.width)}
          >
            {dim.length}" × {dim.width}"
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Size: <span className="font-normal text-muted-foreground">{currentMattress.sizeName}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size}
              variant={size === currentMattress.sizeName ? "default" : "outline"}
              onClick={() => handleSizeSelect(size)}
              className="h-10 px-4 capitalize"
            >
              {size.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Dimension Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Dimensions (L × W):
        </label>
        
        {isDesktop ? (
          <Dialog open={dimensionDialogOpen} onOpenChange={setDimensionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-between text-left px-4 border-primary">
                <span>{currentDimensionLabel}</span>
                <span className="text-xs text-muted-foreground underline">Change</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Dimensions for {currentMattress.sizeName}</DialogTitle>
              </DialogHeader>
              <DimensionList />
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={dimensionDialogOpen} onOpenChange={setDimensionDialogOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-between text-left px-4 border-primary">
                <span>{currentDimensionLabel}</span>
                <span className="text-xs text-muted-foreground underline">Change</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Select Dimensions</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <DimensionList />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Thickness Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Thickness: <span className="font-normal text-muted-foreground">{currentMattress.thickness}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableThicknesses.map((thickness) => (
            <Button
              key={thickness}
              variant={thickness === currentMattress.thickness ? "default" : "outline"}
              onClick={() => handleThicknessSelect(thickness)}
              className="h-10 px-4"
            >
              {thickness}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
