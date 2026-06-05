"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { routes } from "@/lib/routes";

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
import { MattressAttributesStep } from "./steps/mattress-attributes-step";
import { VariantsStep } from "./steps/variants-step";
import { SpecificationsStep } from "./steps/specifications-step";
import { SectionsStep } from "./steps/sections-step";
import { FaqsStep } from "./steps/faqs-step";
import { PreviewStep } from "./steps/preview-step";

interface ProductFormProps {
  initialData?: CreateProductInput;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps = {}) {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData || defaultValues,
    mode: "onChange"
  });
  const router = useRouter();

  console.log("initial data : ", initialData)
  console.log("form errors : ", form.formState.errors);
  console.log("form values : ", form.getValues());

  async function onSubmit(values: CreateProductInput) {
    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();

        if (data.errors) {
          // Iterate over the errors and set them in the form
          Object.keys(data.errors).forEach((key) => {
            form.setError(key as keyof CreateProductInput, {
              type: "server",
              message: data.errors[key]?.message || "Invalid value",
            });
          });
          return;
        }

        throw new Error(data.message || `Failed to ${productId ? "update" : "create"} product`);
      }

      alert(`Product ${productId ? "updated" : "created"} successfully`);
      if (!productId) {
        form.reset();
      }
      router.push(routes.dashboard_products);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : `Failed to ${productId ? "update" : "create"} product`);
    }
  }

  const productType = form.watch("type");

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
        component: <BasicInfoStep form={form} isEditMode={!!productId} />,
      },

      {
        fields: ["thumbnail", "images"],
        component: <MediaStep form={form} />,
      },

      // Conditionally include Mattress Attributes if type is MATTRESS
      ...(productType === "MATTRESS" ? [{
        fields: [
          "firmness",
          "comfortLevel",
          "healthBenefits",
          "recommendedAgeGroups",
          "recommendedWeightGroups",
          "recommendedPositions"
        ],
        component: <MattressAttributesStep form={form} />,
      }] : []),

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

      {
        fields: [], // No fields to validate for preview
        component: <PreviewStep form={form} />,
      },
    ],
    [form, productType],
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
        className="w-full mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm"
      >
        <MultiStepFormContent>
          <FormHeader />

          <StepFields />

          <FormFooter className="flex flex-col sm:flex-row gap-2 items-center justify-end pt-2">
            <PreviousButton className="w-full sm:w-auto">Previous</PreviousButton>

            <NextButton className="w-full sm:w-auto">Next</NextButton>

            <SubmitButton onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
              {productId ? "Update Product" : "Create Product"}
            </SubmitButton>
          </FormFooter>
        </MultiStepFormContent>
      </form>
    </MultiStepFormProvider>
  );
}
