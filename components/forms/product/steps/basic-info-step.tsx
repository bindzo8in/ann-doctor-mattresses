import { useState, useEffect } from "react";
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

import { ChevronsUpDown, Check, RefreshCw, AlertTriangle } from "lucide-react";
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

import { STANDARD_COLORS } from "@/lib/colors";
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
  const [isSlugUnlocked, setIsSlugUnlocked] = useState(!isEditMode);
  
  const nameValue = form.watch("name");
  const { dirtyFields } = form.formState;

  // Auto-generate slug from name in Create Mode (if user hasn't typed in slug manually)
  useEffect(() => {
    if (!isEditMode && !dirtyFields.slug && nameValue) {
      const generated = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", generated, { shouldValidate: true });
    }
  }, [nameValue, isEditMode, dirtyFields.slug, form]);

  const handleManualRegenerate = () => {
    const n = form.getValues("name") || "";
    const generated = n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    form.setValue("slug", generated, { shouldValidate: true, shouldDirty: true });
  };

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

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input 
                {...field} 
                id="slug" 
                placeholder="royal-top-mattress" 
                disabled={!isSlugUnlocked}
                className="flex-1"
              />
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManualRegenerate}
                  disabled={!isSlugUnlocked}
                  title="Auto-generate from Name"
                  className="shrink-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                
                {isEditMode && !isSlugUnlocked && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsSlugUnlocked(true)}
                    className="shrink-0"
                  >
                    Edit Slug
                  </Button>
                )}
              </div>
            </div>

            {isEditMode && isSlugUnlocked && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm">
                  <strong>Warning:</strong> Changing the slug of an existing product will break all current links and affect SEO. Proceed with caution.
                </p>
              </div>
            )}

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

      {/* AVAILABLE COLORS */}
      <Controller
        name="availableColors"
        control={form.control}
        render={({ field, fieldState }) => {
          const selected = field.value || [];
          const allSelected = selected.length === STANDARD_COLORS.length;

          const toggleAll = () => {
            if (allSelected) {
              field.onChange([]);
            } else {
              field.onChange(STANDARD_COLORS.map(c => c.value));
            }
          };

          const toggleColor = (colorValue: string) => {
            if (selected.includes(colorValue)) {
              field.onChange(selected.filter(c => c !== colorValue));
            } else {
              field.onChange([...selected, colorValue]);
            }
          };

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Available Colors</FieldLabel>
              <FieldDescription>Select the colors this product is available in.</FieldDescription>
              
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all-colors" 
                    checked={allSelected} 
                    onCheckedChange={toggleAll} 
                  />
                  <label htmlFor="select-all-colors" className="text-sm font-medium cursor-pointer">
                    Select All Colors
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md bg-slate-50">
                  {STANDARD_COLORS.map(color => (
                    <div key={color.value} className="flex items-center gap-2">
                      <Checkbox 
                        id={`color-${color.value}`} 
                        checked={selected.includes(color.value)} 
                        onCheckedChange={() => toggleColor(color.value)} 
                      />
                      <label htmlFor={`color-${color.value}`} className="flex items-center gap-2 text-sm cursor-pointer">
                        <div className={cn("w-4 h-4 rounded-full", color.tailwindClass)} />
                        {color.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
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
