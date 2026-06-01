"use client";

import {
  Controller,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface ComparisonSectionFormProps {
  form: UseFormReturn<CreateProductInput>;
}

export function ComparisonSectionForm({
  form,
}: ComparisonSectionFormProps) {
  const { fields } =
    useFieldArray({
      control: form.control,
      name: "sections.1.content.items",
    });

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Image Comparison Section
        </h3>
{/* 
        <Button
          type="button"
          onClick={() =>
            append({
              label: "",
              image: null,
            })
          }
        >
          Add Item
        </Button> */}
      </div>

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 space-y-4"
        >
          <Controller
            name={`sections.1.content.items.${index}.label`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel>
                  Label
                </FieldLabel>

                <Input
                  {...field}
                  placeholder="Correct Sleeping Position"
                />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />

          <Controller
            name={`sections.1.content.items.${index}.image`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel>
                  Image
                </FieldLabel>

                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />

          {/* <Button
            type="button"
            variant="destructive"
            onClick={() =>
              remove(index)
            }
          >
            Remove
          </Button> */}
        </div>
      ))}
    </div>
  );
}