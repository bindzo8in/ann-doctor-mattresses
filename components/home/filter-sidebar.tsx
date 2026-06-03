"use client";

import { useState } from "react";
import { ChevronDown, X, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  mattressType: string[];
  priceRange: [number, number];
  firmness: string[];
  size: string[];
  searchQuery: string;
}

const mattressTypes = [
  { value: "memory-foam", label: "Memory Foam" },
  { value: "latex", label: "Latex" },
  { value: "hybrid", label: "Hybrid" },
  { value: "innerspring", label: "Innerspring" },
  { value: "gel", label: "Gel Memory Foam" },
];

const MIN_PRICE = 0;
const MAX_PRICE = 5000;

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-500", label: "Under $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2000", label: "$1,000 - $2,000" },
  { value: "2000+", label: "$2,000+" },
];

const firmnessLevels = [
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "firm", label: "Firm" },
  { value: "extra-firm", label: "Extra Firm" },
];

const sizes = [
  { value: "twin", label: "Twin" },
  { value: "full", label: "Full" },
  { value: "queen", label: "Queen" },
  { value: "king", label: "King" },
  { value: "cal-king", label: "California King" },
];

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
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
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
    filters.mattressType.length,
    filters.priceRange[1] < MAX_PRICE ? 1 : 0,
    filters.firmness.length,
    filters.size.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Search</h3>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search mattresses..."
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
            <span>₹{filters.priceRange[0].toLocaleString()}</span>

            <span className="font-medium">
              ₹{filters.priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </FilterGroup>

      {/* Mattress Type Filter */}
      <FilterGroup title="Mattress Type">
        <FilterCheckboxGroup
          options={mattressTypes}
          selectedValues={filters.mattressType}
          onChange={(values) => onFilterChange("mattressType", values)}
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
      <FilterGroup title="Mattress Size" defaultOpen={true}>
        <FilterCheckboxGroup
          options={sizes}
          selectedValues={filters.size}
          onChange={(values) => onFilterChange("size", values)}
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

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    mattressType: [],
    priceRange: [MIN_PRICE, MAX_PRICE],
    firmness: [],
    size: [],
    searchQuery: "",
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      mattressType: [],
      priceRange: [MIN_PRICE, MAX_PRICE] as [number, number],
      firmness: [],
      size: [],
      searchQuery: "",
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = [
    filters.mattressType.length,
    filters.priceRange[1] < MAX_PRICE ? 1 : 0,
    filters.firmness.length,
    filters.size.length,
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
            <SheetContent side="left" className="w-80 sm:w-96 bg-background">
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
              <div className="sticky top-32 bg-card border border-border rounded-lg p-6 shadow-sm">
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
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">
                  Products will display here based on selected filters
                </p>
              </div>
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
              {filters.mattressType.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {mattressTypes.find((t) => t.value === type)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "mattressType",
                        filters.mattressType.filter((v) => v !== type),
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
                  Up to ₹{filters.priceRange[1].toLocaleString()}
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
              {filters.size.map((sz) => (
                <Badge
                  key={sz}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {sizes.find((s) => s.value === sz)?.label}
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "size",
                        filters.size.filter((v) => v !== sz),
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
