"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { useProductFilters } from "@/lib/filters/use-product-filters";

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  step?: number;
}

export function PriceRangeSlider({ minPrice, maxPrice, step = 100 }: PriceRangeSliderProps) {
  const { searchParams, setFilters } = useProductFilters();
  
  const currentMin = searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : minPrice;
  const currentMax = searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : maxPrice;
  
  const [value, setValue] = React.useState<[number, number]>([currentMin, currentMax]);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setValue([currentMin, currentMax]);
  }, [currentMin, currentMax]);

  // Debounced URL update
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (value[0] !== currentMin || value[1] !== currentMax) {
        if (value[0] === minPrice && value[1] === maxPrice) {
          setFilters({ priceMin: null, priceMax: null });
        } else {
          setFilters({ priceMin: value[0].toString(), priceMax: value[1].toString() });
        }
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [value, currentMin, currentMax, minPrice, maxPrice, setFilters]);

  return (
    <div className="space-y-4 px-4">
      <Slider
        min={minPrice}
        max={maxPrice}
        step={step}
        value={value}
        onValueChange={(val) => setValue(val as [number, number])}
        className="w-full"
      />
      <div className="flex items-center justify-between text-sm">
        <span>₹{value[0].toLocaleString("en-IN")}</span>
        <span className="font-medium">₹{value[1].toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
