"use client";

import { useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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

import {
  createProduct,
  saveBasicInfo,
  saveMedia,
  saveAttributes,
  saveVariants,
  saveSpecifications,
  saveSections,
  saveFaqs,
} from "@/lib/api/product-step-api";

export function ProductCreateForm() {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const router = useRouter();
  const productType = form.watch("type");

  // After step 1 creates the product, store the id here
  const [productId, setProductId] = useState<string | null>(null);
  // Track the current step index to know which save fn to call
  const currentStepIndexRef = useRef<number>(1);

  // ── Per-step save handlers ────────────────────────────────────────────────

  async function handleStepSave(stepIndex: number): Promise<boolean> {
    const values = form.getValues();

    // Step 1 — create or update basic info
    if (stepIndex === 1) {
      const payload = {
        name: values.name,
        slug: values.slug,
        type: values.type,
        categoryId: values.categoryId,
        shortDescription: values.shortDescription,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        availableColors: values.availableColors,
        defaultColor: values.defaultColor,
      };

      if (!productId) {
        // First time — create the product
        const result = await createProduct(payload);
        if (!result.success) {
          applyServerErrors(result.errors);
          toast.error(result.message || "Failed to create product");
          return false;
        }
        setProductId(result.data.id);
      } else {
        // Product already exists — update basic info
        const result = await saveBasicInfo(productId, payload);
        if (!result.success) {
          applyServerErrors(result.errors);
          toast.error(result.message || "Failed to save basic info");
          return false;
        }
      }
      return true;
    }

    // Steps 2+ require a productId
    if (!productId) {
      toast.error("Product ID missing. Please complete step 1 first.");
      return false;
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
      // Sync returned image IDs back into form
      if (result.data?.images) {
        form.setValue("images", result.data.images as any);
      }
      return true;
    }

    // Step 3 — Mattress attributes (only if MATTRESS type)
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

  function applyServerErrors(
    errors?: Record<string, { message: string }>
  ) {
    if (!errors) return;
    Object.entries(errors).forEach(([key, val]) => {
      form.setError(key as keyof CreateProductInput, {
        type: "server",
        message: val.message,
      });
    });
  }

  async function onSubmit() {
    if (!productId) {
      toast.error("Nothing to submit — please complete all steps first.");
      return;
    }
    toast.success("Product created successfully!");
    form.reset();
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
        component: <BasicInfoStep form={form as any} isEditMode={false} />,
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

  const productName = form.watch("name");

  return (
    <MultiStepFormProvider
      stepsFields={steps}
      onStepValidation={async (step, stepIndex) => {
        currentStepIndexRef.current = stepIndex;
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
          <FormHeader title={productName ? `Create Product: ${productName}` : "Create New Product"} />

          <StepFields />

          <FormFooter className="flex flex-col sm:flex-row gap-2 items-center justify-end pt-2">
            <PreviousButton className="w-full sm:w-auto">Previous</PreviousButton>

            <NextButton className="w-full sm:w-auto">Next</NextButton>

            <SubmitButton
              onClick={onSubmit}
              className="w-full sm:w-auto"
            >
              Create Product
            </SubmitButton>
          </FormFooter>
        </MultiStepFormContent>
      </form>
    </MultiStepFormProvider>
  );
}
