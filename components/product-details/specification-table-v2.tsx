import React from "react";
import { ProductSpecification } from "@/app/generated/prisma/browser";

interface Props {
  specifications: ProductSpecification[];
}

export function SpecificationTableV2({ specifications }: Props) {
  if (!specifications?.length) return null;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white">
      {/* Header */}
      <div className="bg-white py-6 md:py-8 flex items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#e52e2e]">
          Product Description:
        </h2>
      </div>
      
      {/* Body Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white">
        {specifications.map((spec) => (
          <React.Fragment key={spec.id}>
            {/* Label Cell */}
            <div className="bg-[#e52e2e] text-white px-4 py-5 sm:px-6 sm:py-6 flex items-center h-full">
              <span className="font-semibold text-sm sm:text-base break-words">
                {spec.label}:
              </span>
            </div>
            {/* Value Cell */}
            <div className="bg-[#e52e2e] text-white px-4 py-5 sm:px-6 sm:py-6 flex items-center h-full">
              <span className="font-bold text-sm sm:text-base leading-snug">
                {spec.value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
