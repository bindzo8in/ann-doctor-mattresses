"use client";

import { Controller, UseFormReturn } from "react-hook-form";

import { CreateProductInput } from "@/lib/schema/product-form-schema";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import { ImageUpload } from "@/components/ui/image-upload";
import { SortableImageUpload } from "@/components/ui/sortable-image-upload";

interface MediaStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function MediaStep({
  form,
}: MediaStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Controller
        name="thumbnail"
        control={form.control}
        render={({
          field,
          fieldState,
        }) => (
          <Field
            data-invalid={
              fieldState.invalid
            }
            className="gap-3"
          >
            <FieldLabel>
              Thumbnail *
            </FieldLabel>

            <FieldDescription>
              Main product image shown in listings,
              search results and product cards.
            </FieldDescription>

            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              placeholder="Upload thumbnail"
            />

            <FieldError
              errors={[
                fieldState.error,
              ]}
            />
          </Field>
        )}
      />

      <FieldSeparator />

      <Controller
        name="images"
        control={form.control}
        render={({
          field,
          fieldState,
        }) => (
          <Field
            data-invalid={
              fieldState.invalid
            }
            className="gap-3"
          >
            <FieldLabel>
              Product Gallery
            </FieldLabel>

            <FieldDescription>
              Upload additional product images.
              Drag and drop to reorder them.
            </FieldDescription>

            <SortableImageUpload
              value={field.value}
              onChange={field.onChange}
              maxFiles={10}
              placeholder="Upload gallery images"
            />

            <FieldError
              errors={[
                fieldState.error,
              ]}
            />
          </Field>
        )}
      />
    </div>
  );
}