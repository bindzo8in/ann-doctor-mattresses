"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setFilters = useCallback(
    (newFilters: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(newFilters)) {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleFilterArray = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.get(name)?.split(",").filter(Boolean) || [];
      
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length > 0) {
        params.set(name, newValues.join(","));
      } else {
        params.delete(name);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearFilters = useCallback(() => {
    // Preserve only the 'type' parameter if it exists
    const params = new URLSearchParams(searchParams.toString());
    const type = params.get("type");
    const newParams = new URLSearchParams();
    if (type) newParams.set("type", type);
    
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return { searchParams, setFilter, setFilters, toggleFilterArray, clearFilters };
}
