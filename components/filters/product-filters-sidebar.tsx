"use client";

import * as React from "react";
import { Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterSection } from "./filter-section";
import { CheckboxFilterGroup } from "./checkbox-filter-group";
import { PriceRangeSlider } from "./price-range-slider";
import { MultiSelectFilter } from "./multi-select-filter";
import { useProductFilters } from "@/lib/filters/use-product-filters";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  FIRMNESS_OPTIONS,
  COMFORT_LEVEL_OPTIONS,
  HEALTH_BENEFIT_OPTIONS,
  SLEEPING_POSITION_OPTIONS,
  AGE_GROUP_OPTIONS,
  WEIGHT_GROUP_OPTIONS,
} from "@/components/forms/product/constants";

const MATTRESS_SIZE_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "QUEEN", label: "Queen" },
  { value: "KING", label: "King" },
  { value: "CUSTOM", label: "Custom" },
];

interface ProductFiltersSidebarProps {
  dynamicFacets: {
    thicknessOptions: { value: string; label: string }[];
    seatingCapacityOptions: { value: string; label: string }[];
    materialOptions: { value: string; label: string }[];
    shapeOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
  };
}

export function ProductFiltersSidebar({ dynamicFacets }: ProductFiltersSidebarProps) {
  const { searchParams } = useProductFilters();
  const currentType = searchParams.get("type");

  const filterContent = (
    <div className="space-y-2 pb-12">
      <FilterSection title="Product Type" defaultOpen>
        <div className="flex flex-col gap-1">
          <Link
            href="/products"
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              !currentType
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            All Products
          </Link>
          <Link
            href="/products?type=MATTRESS"
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              currentType === "MATTRESS"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            Mattresses
          </Link>
          <Link
            href="/products?type=SOFA"
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              currentType === "SOFA"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            Sofas
          </Link>
        </div>
      </FilterSection>

      {dynamicFacets.categoryOptions && dynamicFacets.categoryOptions.length > 0 && (
        <FilterSection title="Category" defaultOpen>
          <MultiSelectFilter 
            paramName="category" 
            options={dynamicFacets.categoryOptions} 
            placeholder="Search categories..."
          />
        </FilterSection>
      )}

      <FilterSection title="Price Range" defaultOpen>
        <PriceRangeSlider minPrice={0} maxPrice={100000} step={500} />
      </FilterSection>

      {(!currentType || currentType === "MATTRESS") && (
        <>
          <FilterSection title="Size" defaultOpen>
            <CheckboxFilterGroup paramName="size" options={MATTRESS_SIZE_OPTIONS} />
          </FilterSection>

          {dynamicFacets.thicknessOptions.length > 0 && (
            <FilterSection title="Thickness">
              <CheckboxFilterGroup paramName="thickness" options={dynamicFacets.thicknessOptions} />
            </FilterSection>
          )}

          <FilterSection title="Firmness">
            <CheckboxFilterGroup paramName="firmness" options={FIRMNESS_OPTIONS} />
          </FilterSection>

          <FilterSection title="Comfort Level">
            <CheckboxFilterGroup paramName="comfortLevel" options={COMFORT_LEVEL_OPTIONS} />
          </FilterSection>

          <FilterSection title="Health Benefits">
            <CheckboxFilterGroup paramName="healthBenefits" options={HEALTH_BENEFIT_OPTIONS} />
          </FilterSection>

          <FilterSection title="Sleeping Position">
            <CheckboxFilterGroup paramName="sleepingPosition" options={SLEEPING_POSITION_OPTIONS} />
          </FilterSection>

          <FilterSection title="Age Group">
            <CheckboxFilterGroup paramName="ageGroup" options={AGE_GROUP_OPTIONS} />
          </FilterSection>

          <FilterSection title="Weight Group">
            <CheckboxFilterGroup paramName="weightGroup" options={WEIGHT_GROUP_OPTIONS} />
          </FilterSection>
        </>
      )}

      {(!currentType || currentType === "SOFA") && (
        <>
          {dynamicFacets.seatingCapacityOptions.length > 0 && (
            <FilterSection title="Seating Capacity" defaultOpen>
              <CheckboxFilterGroup paramName="seatingCapacity" options={dynamicFacets.seatingCapacityOptions} />
            </FilterSection>
          )}

          {dynamicFacets.materialOptions.length > 0 && (
            <FilterSection title="Material" defaultOpen>
              <CheckboxFilterGroup paramName="material" options={dynamicFacets.materialOptions} />
            </FilterSection>
          )}

          {dynamicFacets.shapeOptions.length > 0 && (
            <FilterSection title="Shape" defaultOpen>
              <CheckboxFilterGroup paramName="shape" options={dynamicFacets.shapeOptions} />
            </FilterSection>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className="lg:hidden sticky top-16 z-30 bg-background border-b border-border py-3 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Sliders className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] overflow-y-auto">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            {filterContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-lg p-5 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          {filterContent}
        </div>
      </div>
    </>
  );
}
