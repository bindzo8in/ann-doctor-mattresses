"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { FeaturesSectionForm } from "../sections/features-section-form";
import { ComparisonSectionForm } from "../sections/comparison-section-form";
import { SleeperGuideSectionForm } from "../sections/sleeper-guide-section-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface SectionsStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function SectionsStep({ form }: SectionsStepProps) {
  return (
    <div className="space-y-8">
      {/* section heading */}
      <Controller
        control={form.control}
        name="sectionsHeading"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Sections Heading</FieldLabel>
            <Input
              {...field}
              placeholder="Royal Top Mattress - Sleep Like Royalty"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <FeaturesSectionForm form={form} />

      <ComparisonSectionForm form={form} />

      <SleeperGuideSectionForm form={form} />
    </div>
  );
}
