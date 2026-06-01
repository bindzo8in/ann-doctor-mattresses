"use client";

import {
  Controller,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

interface SpecificationsStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function SpecificationsStep({
  form,
}: SpecificationsStepProps) {
  const { fields, append, remove } =
    useFieldArray({
      control: form.control,
      name: "specifications",
    });

  function addSpecification() {
    append({
      label: "",
      value: "",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Specifications
        </h3>

        <Button
          type="button"
          onClick={addSpecification}
        >
          Add Specification
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No specifications added yet.
        </div>
      )}

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="rounded-lg border p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Specification #{index + 1}
            </h4>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>

          <FieldSeparator />

          <Controller
            name={`specifications.${index}.label`}
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
                  placeholder="Warranty"
                />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />

          <Controller
            name={`specifications.${index}.value`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel>
                  Value
                </FieldLabel>

                <Input
                  {...field}
                  placeholder="10 Years"
                />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
        </div>
      ))}
    </div>
  );
}