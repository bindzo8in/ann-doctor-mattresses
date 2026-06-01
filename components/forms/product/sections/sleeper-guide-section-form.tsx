"use client";

import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TagInput } from "@/components/tag-input";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

interface SleeperGuideSectionFormProps {
  form: UseFormReturn<CreateProductInput>;
}

export function SleeperGuideSectionForm({
  form,
}: SleeperGuideSectionFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections.2.content.guides",
  });

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Sleeper Guide Section</h3>

        <Button
          type="button"
          onClick={() =>
            append({
              title: "",
              mattressType: "",
              supportNeeded: "",
              features: [],
            })
          }
        >
          Add Guide
        </Button>
      </div>

      {fields.map((item, index) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-4">
          <Controller
            name={`sections.2.content.guides.${index}.title`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Title</FieldLabel>

                <Input {...field} placeholder="Back Sleepers" />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`sections.2.content.guides.${index}.mattressType`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Mattress Type</FieldLabel>

                <Input {...field} placeholder="Orthopedic Mattress" />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`sections.2.content.guides.${index}.supportNeeded`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Support Needed</FieldLabel>

                <Input {...field} placeholder="Medium Firm Support" />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`sections.2.content.guides.${index}.features`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Features</FieldLabel>

                <TagInput tags={field.value} setTags={field.onChange} />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
