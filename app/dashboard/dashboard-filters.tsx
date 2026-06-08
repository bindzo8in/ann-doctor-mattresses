"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodFilter } from "@/actions/dashboard";
import { Suspense } from "react";

interface DashboardFiltersProps {
  currentPeriod: PeriodFilter;
}

function FiltersContent({ currentPeriod }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Period:</span>
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="last_month">Last Month</SelectItem>
          <SelectItem value="this_year">This Year</SelectItem>
          <SelectItem value="all_time">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function DashboardFilters({ currentPeriod }: DashboardFiltersProps) {
  return (
    <Suspense fallback={<div className="h-10 w-[200px] bg-muted animate-pulse rounded-md" />}>
      <FiltersContent currentPeriod={currentPeriod} />
    </Suspense>
  );
}
