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

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface FaqsStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function FaqsStep({
  form,
}: FaqsStepProps) {
  const { fields, append, remove } =
    useFieldArray({
      control: form.control,
      name: "faqs",
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          Frequently Asked Questions
        </h3>

        <Button
          type="button"
          onClick={() =>
            append({
              question: "",
              answer: "",
            })
          }
        >
          Add FAQ
        </Button>
      </div>

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 space-y-4"
        >
          <Controller
            name={`faqs.${index}.question`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Question
                </FieldLabel>

                <Input {...field} />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />

          <Controller
            name={`faqs.${index}.answer`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Answer
                </FieldLabel>

                <Textarea
                  {...field}
                  className="min-h-[120px]"
                />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
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