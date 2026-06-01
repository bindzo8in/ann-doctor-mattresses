"use client";

import { Controller, useFieldArray } from "react-hook-form";

import type { UseFormReturn } from "react-hook-form";
import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { SOFA_SHAPES } from "../constants";

interface SofaVariantArrayProps {
  form: UseFormReturn<CreateProductInput>;
}

export function SofaVariantArray({ form }: SofaVariantArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  function addVariant() {
    append({
      variantType: "SOFA",

      seatCount: 1,

      material: "",

      // color: "",

      shape: "STRAIGHT",

      sku: "",

      mrp: 1,

      salesPrice: 1,

      isDefault: fields.length === 0, // Set the first variant as default by default
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sofa Variants</h3>

        <Button type="button" onClick={addVariant}>
          Add Variant
        </Button>
      </div>

      {fields.map((item, index) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Variant #{index + 1}</h4>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                const wasDefault = form.getValues(
                  `variants.${index}.isDefault`,
                );

                remove(index);

                if (wasDefault) {
                  const remaining = form.getValues("variants");

                  if (remaining.length > 0) {
                    form.setValue("variants.0.isDefault", true);
                  }
                }
              }}
            >
              Remove
            </Button>
          </div>

          <FieldSeparator />

          <Controller
            name={`variants.${index}.seatCount`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Seat Count</FieldLabel>

                <Input
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`variants.${index}.material`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Material</FieldLabel>

                <Input {...field} />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* <Controller
            name={`variants.${index}.color`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  Color
                </FieldLabel>

                <Input {...field} />

                <FieldError
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          /> */}

          <Controller
            name={`variants.${index}.shape`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Shape</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SOFA_SHAPES.map((shapes) => (
                        <SelectItem key={shapes.value} value={shapes.value}>
                          {shapes.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name={`variants.${index}.sku`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>SKU</FieldLabel>

                <Input {...field} />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name={`variants.${index}.mrp`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>MRP</FieldLabel>

                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name={`variants.${index}.salesPrice`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Sales Price</FieldLabel>

                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            name={`variants.${index}.isDefault`}
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (!checked) return;

                      const variants = form.getValues("variants");

                      variants.forEach((_, i) => {
                        form.setValue(`variants.${i}.isDefault`, i === index);
                      });
                    }}
                  />

                  <FieldLabel>Default Variant</FieldLabel>
                </div>
              </Field>
            )}
          />
        </div>
      ))}
    </div>
  );
}
