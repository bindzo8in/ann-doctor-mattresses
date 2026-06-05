"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProductFilters } from "@/lib/filters/use-product-filters";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
}

interface ActiveFiltersBarProps {
  dictionaries: Record<string, readonly Option[] | Option[]>;
}

export function ActiveFiltersBar({ dictionaries }: ActiveFiltersBarProps) {
  const { searchParams, toggleFilterArray, setFilters, clearFilters } = useProductFilters();

  const activeChips: { paramName: string; value: string; label: string }[] = [];

  // Price
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  if (priceMin || priceMax) {
    activeChips.push({
      paramName: "price",
      value: "price",
      label: `₹${priceMin || 0} - ₹${priceMax || 500000}`,
    });
  }

  // Iterate over other known array params
  Array.from(searchParams.entries()).forEach(([key, valueStr]) => {
    if (key === "type" || key === "priceMin" || key === "priceMax") return;
    
    const values = valueStr.split(",").filter(Boolean);
    const dictionary = dictionaries[key];
    
    values.forEach((val) => {
      const label = dictionary?.find((o) => o.value === val)?.label || val;
      activeChips.push({
        paramName: key,
        value: val,
        label,
      });
    });
  });

  if (activeChips.length === 0) return null;

  return (
    <div className="bg-muted/50 border-y border-border px-4 sm:px-6 lg:px-8 py-3">
      <div className="container mx-auto flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground mr-2">
          Active filters:
        </span>
        
        {activeChips.map((chip) => (
          <Badge
            key={`${chip.paramName}-${chip.value}`}
            variant="secondary"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal"
          >
            {chip.label}
            <button
              onClick={() => {
                if (chip.paramName === "price") {
                  setFilters({ priceMin: null, priceMax: null });
                } else {
                  toggleFilterArray(chip.paramName, chip.value);
                }
              }}
              className="hover:text-foreground text-muted-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove filter</span>
            </button>
          </Badge>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs h-7 ml-auto text-primary hover:text-primary/80"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
