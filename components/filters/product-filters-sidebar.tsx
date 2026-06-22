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
import { routes } from "@/lib/routes";

import {
  FIRMNESS_OPTIONS,
  COMFORT_LEVEL_OPTIONS,
  HEALTH_BENEFIT_OPTIONS,
  SLEEPING_POSITION_OPTIONS,
} from "@/components/forms/product/constants";

const MATTRESS_SIZE_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "QUEEN", label: "Queen" },
  { value: "KING", label: "King" },
  { value: "CUSTOM", label: "Custom" },
];

/** Maps a weight-range UI option → the firmness values that suit that weight */
const WEIGHT_TO_FIRMNESS: Record<string, string[]> = {
  UNDER_60:  ["SOFT", "MEDIUM_SOFT"],
  KG_60_80:  ["MEDIUM"],
  KG_80_100: ["MEDIUM_FIRM"],
  OVER_100:  ["FIRM"],
};

const WEIGHT_OPTIONS = [
  { value: "UNDER_60",  label: "Under 60 kg",  hint: "Soft / Medium Soft" },
  { value: "KG_60_80",  label: "60 – 80 kg",   hint: "Medium" },
  { value: "KG_80_100", label: "80 – 100 kg",  hint: "Medium Firm" },
  { value: "OVER_100",  label: "Over 100 kg",  hint: "Firm" },
];

/** Maps an age-group UI option → the firmness / healthBenefits that suit that age */
const AGE_TO_FILTERS: Record<string, { firmness?: string[], healthBenefits?: string[] }> = {
  KIDS: { firmness: ["FIRM", "MEDIUM_FIRM"] },
  TEEN: { firmness: ["FIRM", "MEDIUM_FIRM"] },
  ADULT: { firmness: ["MEDIUM", "MEDIUM_FIRM"] },
  SENIOR: { healthBenefits: ["ORTHOPEDIC", "BACK_PAIN_RELIEF"] },
};

const AGE_OPTIONS = [
  { value: "KIDS", label: "Kids", hint: "Firm / Medium Firm" },
  { value: "TEEN", label: "Teen", hint: "Firm / Medium Firm" },
  { value: "ADULT", label: "Adult", hint: "Medium / Medium Firm" },
  { value: "SENIOR", label: "Senior", hint: "Orthopedic Support" },
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
  const { searchParams, setFilter, setFilters } = useProductFilters();
  const currentType = searchParams.get("type");

  // ── Weight → Firmness helper ──────────────────────────────────────────────
  // Derive which weight-range bucket is currently active by looking at the
  // current `firmness` param and matching it back to a weight bucket.
  const currentFirmness = searchParams.get("firmness")?.split(",") ?? [];

  function getActiveWeightKey(): string | null {
    for (const [key, firmnessValues] of Object.entries(WEIGHT_TO_FIRMNESS)) {
      if (firmnessValues.every((f) => currentFirmness.includes(f)) && currentFirmness.length === firmnessValues.length) {
        return key;
      }
    }
    return null;
  }

  function toggleWeight(weightKey: string) {
    const active = getActiveWeightKey();
    if (active === weightKey) {
      // Deselect — clear firmness param
      setFilter("firmness", null);
    } else {
      // Select — set firmness to the mapped values
      setFilter("firmness", WEIGHT_TO_FIRMNESS[weightKey].join(","));
    }
  }

  const activeWeightKey = getActiveWeightKey();

  // ── Age → Firmness/Health helper ─────────────────────────────────────────
  const currentHealth = searchParams.get("healthBenefits")?.split(",") ?? [];

  function getActiveAgeKey(): string | null {
    for (const [key, mapping] of Object.entries(AGE_TO_FILTERS)) {
      const matchFirmness = !mapping.firmness || (mapping.firmness.every(f => currentFirmness.includes(f)) && currentFirmness.length === mapping.firmness.length);
      const matchHealth = !mapping.healthBenefits || (mapping.healthBenefits.every(h => currentHealth.includes(h)) && currentHealth.length === mapping.healthBenefits.length);
      
      if (matchFirmness && matchHealth) {
        if (mapping.firmness || mapping.healthBenefits) return key;
      }
    }
    return null;
  }

  function toggleAge(ageKey: string) {
    const active = getActiveAgeKey();
    const mapping = AGE_TO_FILTERS[ageKey];
    
    if (active === ageKey) {
      // Deselect
      const newFilters: Record<string, string | null> = {};
      if (mapping.firmness) newFilters.firmness = null;
      if (mapping.healthBenefits) newFilters.healthBenefits = null;
      setFilters(newFilters);
    } else {
      // Select
      const newFilters: Record<string, string | null> = {};
      if (mapping.firmness) newFilters.firmness = mapping.firmness.join(",");
      if (mapping.healthBenefits) newFilters.healthBenefits = mapping.healthBenefits.join(",");
      setFilters(newFilters);
    }
  }

  const activeAgeKey = getActiveAgeKey();
  // ─────────────────────────────────────────────────────────────────────────

  const filterContent = (
    <div className="space-y-2 pb-12">
      <FilterSection title="Product Type" defaultOpen>
        <div className="flex flex-col gap-1">
          <Link
            href={routes.products}
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              !currentType
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
            scroll
          >
            All Products
          </Link>
          <Link
            href={`${routes.products}?type=MATTRESS`}
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              currentType === "MATTRESS"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
            scroll
          >
            Mattresses
          </Link>
          <Link
            href={`${routes.products}?type=SOFA`}
            className={cn(
              "text-sm font-medium px-2 py-1.5 rounded-md transition-colors",
              currentType === "SOFA"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
            scroll
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
            <div className="space-y-1">
              {AGE_OPTIONS.map((opt) => {
                const isActive = activeAgeKey === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleAge(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between text-left px-2.5 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className={cn(
                      "text-xs",
                      isActive ? "text-primary/80" : "text-muted-foreground"
                    )}>{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Weight">
            <div className="space-y-1">
              {WEIGHT_OPTIONS.map((opt) => {
                const isActive = activeWeightKey === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleWeight(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between text-left px-2.5 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className={cn(
                      "text-xs",
                      isActive ? "text-primary/80" : "text-muted-foreground"
                    )}>{opt.hint}</span>
                  </button>
                );
              })}
            </div>
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
