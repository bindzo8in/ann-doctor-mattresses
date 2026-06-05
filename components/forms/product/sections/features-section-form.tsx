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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

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

      <div className="flex items-center justify-between mt-6 mb-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Features List</h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              title: "",
              description: "",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto max-w-full w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No features added yet.
                </TableCell>
              </TableRow>
            )}

            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.0.content.features.${index}.title`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="Feature title" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.0.content.features.${index}.description`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Textarea
                          {...field}
                          className="min-h-[80px]"
                          placeholder="Feature description"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}