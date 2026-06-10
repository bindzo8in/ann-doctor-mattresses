"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const BranchMapClient = dynamic(() => import("./branch-map-client"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg min-h-[420px]" />,
});

export function BranchMap({ branches }: { branches: any[] }) {
  return <BranchMapClient branches={branches} />;
}
