"use client";

import { useMemo } from "react";
import { ProductVariantWithDetails } from "@/types/product-details";
import { Button } from "@/components/ui/button";

interface Props {
  variants: ProductVariantWithDetails[];
  selectedVariant: ProductVariantWithDetails;
  onSelect: (variant: ProductVariantWithDetails) => void;
}

export function SofaVariantSelector({ variants, selectedVariant, onSelect }: Props) {
  const currentSofa = selectedVariant.sofaVariant;
  if (!currentSofa) return null;

  // 1. Available Seat Capacities
  const availableCapacities = useMemo(() => {
    const capacities = new Set<number>();
    variants.forEach((v) => {
      if (v.sofaVariant) capacities.add(v.sofaVariant.seatCount);
    });
    return Array.from(capacities).sort((a, b) => a - b);
  }, [variants]);

  // 2. Available Materials for current capacity
  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    variants.forEach((v) => {
      if (v.sofaVariant?.seatCount === currentSofa.seatCount) {
        materials.add(v.sofaVariant.material);
      }
    });
    return Array.from(materials);
  }, [variants, currentSofa.seatCount]);

  // 3. Available Shapes for current capacity + material
  const availableShapes = useMemo(() => {
    const shapes = new Set<string>();
    variants.forEach((v) => {
      if (
        v.sofaVariant?.seatCount === currentSofa.seatCount &&
        v.sofaVariant?.material === currentSofa.material &&
        v.sofaVariant?.shape
      ) {
        shapes.add(v.sofaVariant.shape);
      }
    });
    return Array.from(shapes);
  }, [variants, currentSofa]);

  // Handlers
  const handleCapacitySelect = (seatCount: number) => {
    const newVariant = variants.find((v) => v.sofaVariant?.seatCount === seatCount);
    if (newVariant) onSelect(newVariant);
  };

  const handleMaterialSelect = (material: string) => {
    const newVariant = variants.find(
      (v) =>
        v.sofaVariant?.seatCount === currentSofa.seatCount &&
        v.sofaVariant?.material === material
    );
    if (newVariant) onSelect(newVariant);
  };

  const handleShapeSelect = (shape: string) => {
    const newVariant = variants.find(
      (v) =>
        v.sofaVariant?.seatCount === currentSofa.seatCount &&
        v.sofaVariant?.material === currentSofa.material &&
        v.sofaVariant?.shape === shape
    );
    if (newVariant) onSelect(newVariant);
  };

  return (
    <div className="space-y-6">
      {/* Seat Capacity Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Seat Capacity: <span className="font-normal text-muted-foreground">{currentSofa.seatCount} Seater</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCapacities.map((capacity) => (
            <Button
              key={capacity}
              variant={capacity === currentSofa.seatCount ? "default" : "outline"}
              onClick={() => handleCapacitySelect(capacity)}
              className="h-10 px-4"
            >
              {capacity} Seater
            </Button>
          ))}
        </div>
      </div>

      {/* Material Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Material: <span className="font-normal text-muted-foreground">{currentSofa.material}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableMaterials.map((material) => (
            <Button
              key={material}
              variant={material === currentSofa.material ? "default" : "outline"}
              onClick={() => handleMaterialSelect(material)}
              className="h-10 px-4"
            >
              {material}
            </Button>
          ))}
        </div>
      </div>

      {/* Shape Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Shape: <span className="font-normal text-muted-foreground">{currentSofa.shape}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableShapes.map((shape) => (
            <Button
              key={shape}
              variant={shape === currentSofa.shape ? "default" : "outline"}
              onClick={() => handleShapeSelect(shape)}
              className="h-10 px-4"
            >
              {shape}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
