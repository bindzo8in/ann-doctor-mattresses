"use client";

import * as React from "react";
import { MultiSelect } from "@/components/multi-select";
import { useProductFilters } from "@/lib/filters/use-product-filters";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  paramName: string;
  options: readonly Option[] | Option[];
  placeholder?: string;
}

export function MultiSelectFilter({ paramName, options, placeholder }: MultiSelectFilterProps) {
  const { searchParams, setFilters } = useProductFilters();
  
  const currentValues = searchParams.get(paramName)?.split(",").filter(Boolean) || [];

  return (
    <MultiSelect
      options={options as any}
      defaultValue={currentValues}
      onValueChange={(values) => {
        setFilters({ [paramName]: values.length > 0 ? values.join(",") : null });
      }}
      placeholder={placeholder || "Select items..."}
      searchable={true}
      className="w-full bg-white text-slate-800"
    />
  );
}
