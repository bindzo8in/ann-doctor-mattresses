"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function MobileBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="md:hidden flex items-center gap-1 mb-4 text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}
