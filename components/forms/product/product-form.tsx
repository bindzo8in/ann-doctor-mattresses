"use client";

import { useMemo, useEffect, useState } from "react";
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
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: initialData || defaultValues,
    mode: "onChange"
  });
  const router = useRouter();


  const DRAFT_KEY = `product_form_draft_${productId || "new"}`;
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!isRestored) {
      if (!productId) {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            form.reset(parsedDraft);
          } catch (e) {
            console.error("Failed to parse form draft", e);
          }
        }
      }
      setIsRestored(true);
    }
  }, [DRAFT_KEY, isRestored, form, productId]);

  useEffect(() => {
    if (isRestored && !productId) {
      const subscription = form.watch((value) => {
        // Save the current form state
        localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [form, DRAFT_KEY, isRestored, productId]);

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
          const errorMessages: string[] = [];
          // Iterate over the errors and set them in the form
          Object.keys(data.errors).forEach((key) => {
            const msg = data.errors[key]?.message || "Invalid value";
            errorMessages.push(`${key}: ${msg}`);
            form.setError(key as keyof CreateProductInput, {
              type: "server",
              message: msg,
            });
          });
          alert("Failed to save product due to validation errors:\n\n" + errorMessages.join("\n"));
          return;
        }

        throw new Error(data.message || `Failed to ${productId ? "update" : "create"} product`);
      }

      alert(`Product ${productId ? "updated" : "created"} successfully`);
      localStorage.removeItem(DRAFT_KEY); // Clear draft on success
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
        component: <BasicInfoStep form={form as any} isEditMode={!!productId} />,
      },

      {
        fields: ["thumbnail", "images"],
        component: <MediaStep form={form as any} />,
      },

      // Conditionally include Mattress Attributes if type is MATTRESS
      ...(productType === "MATTRESS" ? [{
        fields: [
          "firmness",
          "comfortLevel",
          "healthBenefits",
          "recommendedPositions"
        ],
        component: <MattressAttributesStep form={form as any} />,
      }] : []),

      {
        fields: ["variants"],
        component: <VariantsStep form={form as any} />,
      },

      {
        fields: ["specifications"],
        component: <SpecificationsStep form={form as any} />,
      },

      {
        fields: ["sections"],
        component: <SectionsStep form={form as any} />,
      },

      {
        fields: ["faqs"],
        component: <FaqsStep form={form as any} />,
      },

      {
        fields: [], // No fields to validate for preview
        component: <PreviewStep form={form as any} />,
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
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="w-full mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm"
      >
        <MultiStepFormContent>
          <FormHeader />

          <StepFields />

          <FormFooter className="flex flex-col sm:flex-row gap-2 items-center justify-end pt-2">
            <PreviousButton className="w-full sm:w-auto">Previous</PreviousButton>

            <NextButton className="w-full sm:w-auto">Next</NextButton>

            <SubmitButton onClick={form.handleSubmit(onSubmit as any)} className="w-full sm:w-auto">
              {productId ? "Update Product" : "Create Product"}
            </SubmitButton>
          </FormFooter>
        </MultiStepFormContent>
      </form>
    </MultiStepFormProvider>
  );
}
