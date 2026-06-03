"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/schema/product-form-schema";

import { MultiStepFormProvider } from "@/hooks/use-multi-step-viewer";

import {
  FormFooter,
  FormHeader,
  MultiStepFormContent,
  NextButton,
  PreviousButton,
  StepFields,
  SubmitButton,
} from "@/components/multi-step-viewer";

import { defaultValues } from "./constants";

import { BasicInfoStep } from "./steps/basic-info-step";
import { MediaStep } from "./steps/media-step";
import { VariantsStep } from "./steps/variants-step";
import { SpecificationsStep } from "./steps/specifications-step";
import { SectionsStep } from "./steps/sections-step";
import { FaqsStep } from "./steps/faqs-step";

export function ProductForm() {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
  });

  console.log(form.formState.errors);
  console.table(form.getValues());

  async function onSubmit(values: CreateProductInput) {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create product");

      alert("Product created successfully");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  }

  const steps = useMemo(
    () => [
      {
        fields: [
          "name",
          "slug",
          "type",
          "categoryId",
          "shortDescription",
          "description",
          "isFeatured",
          "isActive",
        ],
        component: <BasicInfoStep form={form} />,
      },

      {
        fields: ["thumbnail", "images"],
        component: <MediaStep form={form} />,
      },

      {
        fields: ["variants"],
        component: <VariantsStep form={form} />,
      },

      {
        fields: ["specifications"],
        component: <SpecificationsStep form={form} />,
      },

      {
        fields: ["sections"],
        component: <SectionsStep form={form} />,
      },

      {
        fields: ["faqs"],
        component: <FaqsStep form={form} />,
      },
    ],
    [form],
  );

  return (
    <MultiStepFormProvider
      stepsFields={steps}
      onStepValidation={async (step) => {
        const result = await form.trigger(step.fields as never);

        return result;
      }}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm"
      >
        <MultiStepFormContent>
          <FormHeader />

          <StepFields />

          <FormFooter className="flex flex-col sm:flex-row gap-2 items-center justify-end pt-2">
            <PreviousButton className="w-full sm:w-auto">Previous</PreviousButton>

            <NextButton className="w-full sm:w-auto">Next</NextButton>

            <SubmitButton onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
              Create Product
            </SubmitButton>
          </FormFooter>
        </MultiStepFormContent>
      </form>
    </MultiStepFormProvider>
  );
}
