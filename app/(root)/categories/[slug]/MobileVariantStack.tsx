"use client";

import Image from "next/image";
import Link from "next/link";
import type { Variant } from "./variant";
import { ArrowRight } from "lucide-react";

interface MobileVariantStackProps {
  variants: Variant[];
}

export function MobileVariantStack({
  variants,
}: MobileVariantStackProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-6 px-4 pb-8">
      {variants.map((variant) => (
        <Link
          href={variant.link}
          key={variant.id}
          className="group block w-full bg-white rounded-[32px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="relative h-[220px] w-full overflow-hidden rounded-[24px] bg-slate-50 mb-5">
            {variant.imageUrl && (
              <Image
                src={variant.imageUrl}
                alt={variant.name}
                fill
                className="object-cover"
              />
            )}
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent pointer-events-none" />
          </div>
          
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xl font-bold text-slate-800 leading-tight pr-4">
              {variant.name}
            </h3>
            
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}