"use client";

import type { UseFormReturn } from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { FeaturesSectionForm } from "../sections/features-section-form";
import { ComparisonSectionForm } from "../sections/comparison-section-form";
import { SleeperGuideSectionForm } from "../sections/sleeper-guide-section-form";

interface SectionsStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function SectionsStep({
  form,
}: SectionsStepProps) {
  return (
    <div className="space-y-8">
      <FeaturesSectionForm form={form} />

      <ComparisonSectionForm form={form} />

      <SleeperGuideSectionForm form={form} />
    </div>
  );
}