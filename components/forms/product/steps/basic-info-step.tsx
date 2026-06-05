import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field";

import { Controller, UseFormReturn } from "react-hook-form";
import { CreateProductInput } from "@/lib/schema/product-form-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { ChevronsUpDown, Check } from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "@/components/ui/command";
import { TagInput } from "@/components/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CategoryCombobox } from "../category-combobox";

interface BasicInfoStepProps {
  form: UseFormReturn<CreateProductInput>;
  isEditMode?: boolean;
}

const PRODUCT_TYPES = [
  {
    value: "MATTRESS",
    label: "Mattress",
  },
  {
    value: "SOFA",
    label: "Sofa",
  },
];

export function BasicInfoStep({ form, isEditMode }: BasicInfoStepProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* NAME */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Product Name *</FieldLabel>

            <Input {...field} id="name" placeholder="Royal Top Mattress" />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* SLUG */}
      <Controller
        name="slug"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="slug">Slug *</FieldLabel>

            <Input {...field} id="slug" placeholder="royal-top-mattress" />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FieldSeparator />

      {/* PRODUCT TYPE */}
      <Controller
        name="type"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Product Type</FieldLabel>

            <RadioGroup
              disabled={isEditMode}
              value={field.value}
              onValueChange={(newType) => {
                if (newType === field.value) return;

                const variants = form.getValues("variants");

                const confirmed = window.confirm(
                  "Changing the product type will reset all variants and type-specific attributes. Continue?"
                );

                if (!confirmed) return;

                if (variants.length > 0) {
                  form.setValue("variants", []);
                }

                if (newType === "SOFA") {
                  form.setValue("firmness", "" as any);
                  form.setValue("comfortLevel", "" as any);
                  form.setValue("healthBenefits", []);
                  form.setValue("recommendedAgeGroups", []);
                  form.setValue("recommendedWeightGroups", []);
                  form.setValue("recommendedPositions", []);
                }

                field.onChange(newType);
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <FieldLabel htmlFor="mattress-type">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Mattress</FieldTitle>
                    <FieldDescription>
                      Mattress products with multiple size variants.
                    </FieldDescription>
                  </FieldContent>

                  <RadioGroupItem value="MATTRESS" id="mattress-type" />
                </Field>
              </FieldLabel>

              <FieldLabel htmlFor="sofa-type">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Sofa</FieldTitle>
                    <FieldDescription>
                      Sofa products with seating and material variants.
                    </FieldDescription>
                  </FieldContent>

                  <RadioGroupItem value="SOFA" id="sofa-type" />
                </Field>
              </FieldLabel>
            </RadioGroup>

            {fieldState.error && (
              <FieldDescription className="text-destructive">
                {fieldState.error.message}
              </FieldDescription>
            )}
          </Field>
        )}
      />

      {/* CATEGORY */}
      <Controller
        control={form.control}
        name="categoryId"
        render={({ field, fieldState }) => (

          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="categoryId">Category *</FieldLabel>
            <CategoryCombobox value={field.value} onChange={field.onChange} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <FieldSeparator />

      {/* SHORT DESCRIPTION */}
      <Controller
        name="shortDescription"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="shortDescription">
              Short Description
            </FieldLabel>

            <TagInput tags={field.value} setTags={field.onChange} />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FieldSeparator />

      {/* FEATURED + ACTIVE */}
      <Controller
        name="isFeatured"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isFeatured"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor="isFeatured">Featured *</FieldLabel>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="isActive"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor="isActive">Active *</FieldLabel>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}
