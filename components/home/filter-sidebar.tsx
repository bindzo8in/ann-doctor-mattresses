"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "../ui/slider";

export interface FilterState {
  type: string[];
  categories: string[];
  firmness: string[];
  sizes: string[];
  priceRange: [number, number];
  searchQuery: string;
}

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
  children: React.ReactNode;
}

const productTypes = [
  { value: "MATTRESS", label: "Mattress" },
  { value: "SOFA", label: "Sofa" },
];

const categories = [
  { value: "luxury-mattresses", label: "Luxury Mattresses" },
  { value: "budget-mattresses", label: "Budget Mattresses" },
  { value: "orthopedic-mattresses", label: "Orthopedic Mattresses" },
  { value: "modern-sofas", label: "Modern Sofas" },
  { value: "classic-sofas", label: "Classic Sofas" },
];

const firmnessLevels = [
  { value: "SOFT", label: "Soft" },
  { value: "MEDIUM_SOFT", label: "Medium Soft" },
  { value: "MEDIUM", label: "Medium" },
  { value: "MEDIUM_FIRM", label: "Medium Firm" },
  { value: "FIRM", label: "Firm" },
];

const mattressSizes = [
  { value: "Twin", label: "Twin" },
  { value: "Full", label: "Full" },
  { value: "Queen", label: "Queen" },
  { value: "King", label: "King" },
  { value: "California King", label: "California King" },
];

const MIN_PRICE = 0;
const MAX_PRICE = 5000;

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-0 font-medium text-foreground hover:text-primary transition-colors"
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      {isOpen && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function FilterCheckboxGroup({
  options,
  selectedValues,
  onChange,
}: {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const handleChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <Checkbox
            id={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) =>
              handleChange(option.value, checked as boolean)
            }
            className="border-border"
          />
          <Label
            htmlFor={option.value}
            className="text-sm font-normal cursor-pointer text-foreground hover:text-primary transition-colors"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

function FilterSidebarContent({
  filters,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearAll: () => void;
}) {
  const activeFiltersCount = [
    filters.type.length,
    filters.categories.length,
    filters.priceRange[1] < MAX_PRICE ? 1 : 0,
    filters.firmness.length,
    filters.sizes.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Search</h3>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-md border border-border bg-input text-foreground placeholder:text-muted-foreground"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange("searchQuery", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Price Range Filter */}
      <FilterGroup title="Price Range">
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              onFilterChange("priceRange", value as [number, number])
            }
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={100}
          />

          <div className="flex justify-between text-sm">
            <span>₹{filters.priceRange[0].toLocaleString("en-IN")}</span>

            <span className="font-medium">
              ₹{filters.priceRange[1].toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </FilterGroup>

      {/* Product Type Filter */}
      <FilterGroup title="Product Type">
        <FilterCheckboxGroup
          options={productTypes}
          selectedValues={filters.type}
          onChange={(values) => onFilterChange("type", values)}
        />
      </FilterGroup>
      
      {/* Categories Filter */}
      <FilterGroup title="Categories" defaultOpen={true}>
        <FilterCheckboxGroup
          options={categories}
          selectedValues={filters.categories}
          onChange={(values) => onFilterChange("categories", values)}
        />
      </FilterGroup>

      {/* Firmness Filter */}
      <FilterGroup title="Firmness" defaultOpen={true}>
        <FilterCheckboxGroup
          options={firmnessLevels}
          selectedValues={filters.firmness}
          onChange={(values) => onFilterChange("firmness", values)}
        />
      </FilterGroup>

      {/* Size Filter */}
      <FilterGroup title="Size" defaultOpen={true}>
        <FilterCheckboxGroup
          options={mattressSizes}
          selectedValues={filters.sizes}
          onChange={(values) => onFilterChange("sizes", values)}
        />
      </FilterGroup>

      <Separator className="bg-border" />

      {/* Clear and Apply Buttons */}
      <div className="space-y-3">
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between bg-soft-pink rounded-lg p-3">
            <span className="text-sm font-medium text-foreground">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""}{" "}
              active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-primary hover:text-primary/80"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FilterSidebar({ onFiltersChange, children }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    categories: [],
    priceRange: [MIN_PRICE, MAX_PRICE],
    firmness: [],
    sizes: [],
    searchQuery: "",
  });

  // Debounce the onFiltersChange specifically for the slider and search input
  // to avoid rapid API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      onFiltersChange?.(filters);
    }, 300);

    return () => clearTimeout(handler);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      type: [],
      categories: [],
      priceRange: [MIN_PRICE, MAX_PRICE],
      firmness: [],
      sizes: [],
      searchQuery: "",
    });
  };

  const activeFiltersCount = [
    filters.type.length,
    filters.categories.length,
    filters.priceRange[1] < MAX_PRICE ? 1 : 0,
    filters.firmness.length,
    filters.sizes.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Mobile Filter Sidebar - Sheet */}
      <div className="lg:hidden sticky top-16 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 border-border">
                <Sliders className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96 bg-background overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-foreground">Filters</SheetTitle>
              </SheetHeader>
              <FilterSidebarContent
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAllFilters}
              />
            </SheetContent>
          </Sheet>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-primary"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Left Column */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32 bg-card border border-border rounded-lg p-6 shadow-sm overflow-y-auto max-h-[85vh]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterSidebarContent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={clearAllFilters}
                />
              </div>
            </aside>

            {/* Products Grid - Right Column */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display - Below Sidebar on Desktop, in Sheet on Mobile */}
      {activeFiltersCount > 0 && (
        <div className="hidden lg:block bg-soft-pink/50 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-foreground">
                Active filters:
              </span>
              {filters.type.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {productTypes.find((pt) => pt.value === t)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "type",
                        filters.type.filter((v) => v !== t),
                      )
                    }
                    className="hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.categories.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {categories.find((cat) => cat.value === c)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "categories",
                        filters.categories.filter((v) => v !== c),
                      )
                    }
                    className="hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.priceRange[1] < MAX_PRICE && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Up to ₹{filters.priceRange[1].toLocaleString("en-IN")}
                  <button
                    onClick={() =>
                      handleFilterChange("priceRange", [MIN_PRICE, MAX_PRICE])
                    }
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.firmness.map((firm) => (
                <Badge
                  key={firm}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {firmnessLevels.find((f) => f.value === firm)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "firmness",
                        filters.firmness.filter((v) => v !== firm),
                      )
                    }
                    className="hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.sizes.map((sz) => (
                <Badge
                  key={sz}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {mattressSizes.find((s) => s.value === sz)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "sizes",
                        filters.sizes.filter((v) => v !== sz),
                      )
                    }
                    className="hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
