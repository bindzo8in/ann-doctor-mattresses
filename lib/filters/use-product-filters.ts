"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const actualSearchParams = useSearchParams();

  const [optimisticParams, setOptimisticParams] = React.useState<URLSearchParams>(
    new URLSearchParams(actualSearchParams.toString())
  );

  React.useEffect(() => {
    setOptimisticParams(new URLSearchParams(actualSearchParams.toString()));
  }, [actualSearchParams]);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const applyParamsDebounced = useCallback(
    (params: URLSearchParams) => {
      setOptimisticParams(new URLSearchParams(params.toString()));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 400);
    },
    [pathname, router]
  );

  const setFilter = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(optimisticParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      applyParamsDebounced(params);
    },
    [optimisticParams, applyParamsDebounced]
  );

  const setFilters = useCallback(
    (newFilters: Record<string, string | null>) => {
      const params = new URLSearchParams(optimisticParams.toString());
      for (const [name, value] of Object.entries(newFilters)) {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      applyParamsDebounced(params);
    },
    [optimisticParams, applyParamsDebounced]
  );

  const toggleFilterArray = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(optimisticParams.toString());
      const currentValues = params.get(name)?.split(",").filter(Boolean) || [];
      
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length > 0) {
        params.set(name, newValues.join(","));
      } else {
        params.delete(name);
      }
      applyParamsDebounced(params);
    },
    [optimisticParams, applyParamsDebounced]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(optimisticParams.toString());
    const type = params.get("type");
    const newParams = new URLSearchParams();
    if (type) newParams.set("type", type);
    
    applyParamsDebounced(newParams);
  }, [optimisticParams, applyParamsDebounced]);

  return { searchParams: optimisticParams, setFilter, setFilters, toggleFilterArray, clearFilters };
}
