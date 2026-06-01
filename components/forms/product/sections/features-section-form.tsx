"use client";

import {
  Controller,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface Props {
  form: UseFormReturn<CreateProductInput>;
}

export function FeaturesSectionForm({
  form,
}: Props) {
  const { fields, append, remove } =
    useFieldArray({
      control: form.control,
      name:
        "sections.0.content.features",
    });

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="font-medium">
        Features Section
      </h3>

      <Controller
        name="sections.0.content.description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>
              Description
            </FieldLabel>

            <Textarea {...field} />

            <FieldError
              errors={[fieldState.error]}
            />
          </Field>
        )}
      />

      <Controller
        name="sections.0.content.image"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>
              Feature Image
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

      <Button
        type="button"
        onClick={() =>
          append({
            title: "",
            description: "",
          })
        }
      >
        Add Feature
      </Button>

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="border rounded p-4 space-y-3"
        >
          <Controller
            name={`sections.0.content.features.${index}.title`}
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Feature title"
              />
            )}
          />

          <Controller
            name={`sections.0.content.features.${index}.description`}
            control={form.control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Feature description"
              />
            )}
          />

          <Button
            type="button"
            variant="destructive"
            onClick={() =>
              remove(index)
            }
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}