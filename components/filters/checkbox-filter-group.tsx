"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useProductFilters } from "@/lib/filters/use-product-filters";

interface Option {
  value: string;
  label: string;
}

interface CheckboxFilterGroupProps {
  paramName: string;
  options: readonly Option[] | Option[];
}

export function CheckboxFilterGroup({ paramName, options }: CheckboxFilterGroupProps) {
  const { searchParams, toggleFilterArray } = useProductFilters();
  
  const currentValues = searchParams.get(paramName)?.split(",").filter(Boolean) || [];

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = currentValues.includes(option.value);
        return (
          <div key={option.value} className="flex items-center gap-3">
            <Checkbox
              id={`${paramName}-${option.value}`}
              checked={isChecked}
              onCheckedChange={() => toggleFilterArray(paramName, option.value)}
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`${paramName}-${option.value}`}
              className="text-sm font-normal cursor-pointer hover:text-primary transition-colors text-foreground"
            >
              {option.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
