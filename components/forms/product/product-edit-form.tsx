"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { routes } from "@/lib/routes";

import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/schema/product-form-schema";

import { MultiStepFormProvider, useMultiStepForm } from "@/hooks/use-multi-step-viewer";
import { Button } from "@/components/ui/button";

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

import {
  saveBasicInfo,
  saveMedia,
  saveAttributes,
  saveVariants,
  saveSpecifications,
  saveSections,
  saveFaqs,
} from "@/lib/api/product-step-api";

interface ProductEditFormProps {
  initialData: CreateProductInput;
  productId: string;
}

export function ProductEditForm({ initialData, productId }: ProductEditFormProps) {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: initialData || defaultValues,
    mode: "onChange",
  });

  const router = useRouter();
  const productType = form.watch("type");

  // ── Per-step save handlers ────────────────────────────────────────────────

  function applyServerErrors(errors?: Record<string, { message: string }>) {
    if (!errors) return;
    Object.entries(errors).forEach(([key, val]) => {
      form.setError(key as keyof CreateProductInput, {
        type: "server",
        message: val.message,
      });
    });
  }
  // console.log(form.getValues())

  async function handleStepSave(stepIndex: number): Promise<boolean> {
    const values = form.getValues();
    // console.log(form.formState.errors)
    if (stepIndex === 1) {
      const result = await saveBasicInfo(productId, {
        name: values.name,
        slug: values.slug,
        type: values.type,
        categoryId: values.categoryId,
        shortDescription: values.shortDescription,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        availableColors: values.availableColors,
        defaultColor: values.defaultColor,
      });
      if (!result.success) {
        applyServerErrors(result.errors);
        toast.error(result.message || "Failed to save basic info");
        return false;
      }
      return true;
    }

    if (stepIndex === 2) {
      const result = await saveMedia(productId, {
        thumbnail: values.thumbnail,
        images: values.images,
      });
      if (!result.success) {
        applyServerErrors(result.errors);
        toast.error(result.message || "Failed to save media");
        return false;
      }
      if (result.data?.images) {
        form.setValue("images", result.data.images as any);
      }
      return true;
    }

    const isAttributesStep = productType === "MATTRESS" ? stepIndex === 3 : false;
    const variantsStepIndex = productType === "MATTRESS" ? 4 : 3;
    const specsStepIndex = productType === "MATTRESS" ? 5 : 4;
    const sectionsStepIndex = productType === "MATTRESS" ? 6 : 5;
    const faqsStepIndex = productType === "MATTRESS" ? 7 : 6;

    if (isAttributesStep) {
      const result = await saveAttributes(productId, {
        firmness: values.firmness,
        comfortLevel: values.comfortLevel,
        healthBenefits: values.healthBenefits,
        recommendedPositions: values.recommendedPositions,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to save attributes");
        return false;
      }
      return true;
    }

    if (stepIndex === variantsStepIndex) {
      const result = await saveVariants(productId, {
        variants: values.variants,
        allowCustomSize: values.allowCustomSize,
        minWidth: values.minWidth,
        maxWidth: values.maxWidth,
        minLength: values.minLength,
        maxLength: values.maxLength,
        customSizePricing: values.customSizePricing,
        customSizeMrpPricing: values.customSizeMrpPricing,
        baseMrpPerSqFtPerInch: values.baseMrpPerSqFtPerInch,
        baseSalePricePerSqFtPerInch: values.baseSalePricePerSqFtPerInch,
      });
      if (!result.success) {
        applyServerErrors(result.errors);
        toast.error(result.message || "Failed to save variants");
        return false;
      }
      // Sync returned variant IDs back into form to prevent ID drift
      if (result.data?.variants) {
        form.setValue("variants", result.data.variants as any);
      }
      return true;
    }

    if (stepIndex === specsStepIndex) {
      const result = await saveSpecifications(productId, {
        specifications: values.specifications,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to save specifications");
        return false;
      }
      if (result.data?.specifications) {
        form.setValue("specifications", result.data.specifications as any);
      }
      return true;
    }

    if (stepIndex === sectionsStepIndex) {
      const result = await saveSections(productId, {
        sections: values.sections,
        sectionsHeading: values.sectionsHeading,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to save sections");
        return false;
      }
      return true;
    }

    if (stepIndex === faqsStepIndex) {
      const result = await saveFaqs(productId, { faqs: values.faqs });
      if (!result.success) {
        toast.error(result.message || "Failed to save FAQs");
        return false;
      }
      if (result.data?.faqs) {
        form.setValue("faqs", result.data.faqs as any);
      }
      return true;
    }

    return true;
  }

  async function onSubmit() {
    toast.success("Product updated successfully!");
    router.push(routes.dashboard_products);
    router.refresh();
  }

  const steps = useMemo(
    () => [
      {
        title: "Basic Info",
        fields: [
          "name",
          "slug",
          "type",
          "categoryId",
          "shortDescription",
          "isFeatured",
          "isActive",
          "availableColors",
        ],
        component: <BasicInfoStep form={form as any} isEditMode={true} />,
      },

      {
        title: "Media",
        fields: ["thumbnail", "images"],
        component: <MediaStep form={form as any} />,
      },

      ...(productType === "MATTRESS"
        ? [
            {
              title: "Mattress Attributes",
              fields: [
                "firmness",
                "comfortLevel",
                "healthBenefits",
                "recommendedPositions",
              ],
              component: <MattressAttributesStep form={form as any} />,
            },
          ]
        : []),

      {
        title: "Variants",
        fields: ["variants"],
        component: <VariantsStep form={form as any} />,
      },

      {
        title: "Specifications",
        fields: ["specifications"],
        component: <SpecificationsStep form={form as any} />,
      },

      {
        title: "Sections",
        fields: ["sections"],
        component: <SectionsStep form={form as any} />,
      },

      {
        title: "FAQs",
        fields: ["faqs"],
        component: <FaqsStep form={form as any} />,
      },

      {
        title: "Preview",
        fields: [],
        component: <PreviewStep form={form as any} />,
      },
    ],
    [form, productType]
  );

  async function handleSaveAndExit(stepIndex: number) {
    const step = steps[stepIndex - 1];
    const isValid = await form.trigger(step.fields as never);
    if (!isValid) return;

    const saved = await handleStepSave(stepIndex);
    if (saved) {
      toast.success("Product saved successfully!");
      router.push(routes.dashboard_products);
      router.refresh();
    }
  }

  const productName = form.watch("name") || initialData?.name || "";
  const productSlug = form.watch("slug") || initialData?.slug || "";

  const titleNode = (
    <div className="flex flex-wrap items-baseline gap-2">
      <span>Edit Product: <span className="text-red-600 font-semibold">{productName || "Product"}</span></span>
      {productSlug && (
        <span className="text-xs sm:text-sm font-mono text-slate-500 font-normal">
          ({productSlug})
        </span>
      )}
    </div>
  );

  return (
    <MultiStepFormProvider
      stepsFields={steps}
      onStepValidation={async (step, stepIndex) => {
        const result = await form.trigger(step.fields as never);
        if (!result) return false;
        return handleStepSave(stepIndex);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="w-full mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm"
      >
        <MultiStepFormContent>
          <FormHeader title={titleNode} />

          <StepFields />

          <FormFooter className="flex flex-col sm:flex-row gap-2 items-center justify-end pt-2">
            <PreviousButton className="w-full sm:w-auto">Previous</PreviousButton>

            <SaveAndExitButton onSaveAndExit={handleSaveAndExit} />

            <NextButton className="w-full sm:w-auto">Next</NextButton>

            <SubmitButton onClick={onSubmit} className="w-full sm:w-auto">
              Save Changes
            </SubmitButton>
          </FormFooter>
        </MultiStepFormContent>
      </form>
    </MultiStepFormProvider>
  );
}

function SaveAndExitButton({ onSaveAndExit }: { onSaveAndExit: (stepIndex: number) => void }) {
  const { currentStepIndex, isLastStep } = useMultiStepForm();
  if (isLastStep) return null;
  
  return (
    <Button 
      type="button" 
      variant="secondary" 
      onClick={() => onSaveAndExit(currentStepIndex)}
      className="w-full sm:w-auto"
    >
      Save & Exit
    </Button>
  );
}
