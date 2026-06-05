"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { CreateProductInput } from "@/lib/schema/product-form-schema";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/multi-select";

import {
  AGE_GROUP_OPTIONS,
  FIRMNESS_OPTIONS,
  SLEEPING_POSITION_OPTIONS,
  WEIGHT_GROUP_OPTIONS,
  HEALTH_BENEFIT_OPTIONS,
  COMFORT_LEVEL_OPTIONS,
} from "../constants";

interface MattressAttributesStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function MattressAttributesStep({ form }: MattressAttributesStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Mattress Attributes</h3>
          <p className="text-sm text-muted-foreground">
            Configure global attributes that apply to all variants of this mattress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          control={form.control}
          name="firmness"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Firmness</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Firmness" />
                </SelectTrigger>
                <SelectContent>
                  {FIRMNESS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="comfortLevel"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Comfort Level</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Comfort Level" />
                </SelectTrigger>
                <SelectContent>
                  {COMFORT_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="healthBenefits"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Health Benefits</FieldLabel>
              <MultiSelect
                options={[...HEALTH_BENEFIT_OPTIONS]}
                defaultValue={field.value ?? []}
                onValueChange={field.onChange}
                placeholder="Select Health Benefits"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="recommendedAgeGroups"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Recommended Age Groups</FieldLabel>
              <MultiSelect
                options={[...AGE_GROUP_OPTIONS]}
                defaultValue={field.value ?? []}
                onValueChange={field.onChange}
                placeholder="Select Age Groups"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="recommendedWeightGroups"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Recommended Weight Groups</FieldLabel>
              <MultiSelect
                options={[...WEIGHT_GROUP_OPTIONS]}
                defaultValue={field.value ?? []}
                onValueChange={field.onChange}
                placeholder="Select Weight Groups"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="recommendedPositions"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Recommended Sleeping Positions</FieldLabel>
              <MultiSelect
                options={[...SLEEPING_POSITION_OPTIONS]}
                defaultValue={field.value ?? []}
                onValueChange={field.onChange}
                placeholder="Select Positions"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
    </div>
  );
}
