"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { MattressVariantArray } from "../variants/mattress-variant-form";
import { SofaVariantArray } from "../variants/sofa-variant-form";
import { useEffect } from "react";

interface VariantsStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function VariantsStep({ form }: VariantsStepProps) {
  const productType = form.watch("type");
  const variants = useWatch({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    // Validation on every small variants change produced noisy errors.
    // Validation will run on step navigation via the provider's `onStepValidation`.
  }, [variants, form]);

  const variantsError =
    (form.formState.errors.variants as any)?.root;


  return (
    <div className="space-y-6">
      {variantsError && (
        <p className="text-sm font-medium text-destructive">
          {variantsError.message}
        </p>
      )}

      {productType === "MATTRESS" ? (
        <MattressVariantArray form={form} />
      ) : (
        <SofaVariantArray form={form} />
      )}
    </div>
  );
}
