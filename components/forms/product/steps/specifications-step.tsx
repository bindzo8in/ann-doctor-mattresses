"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (form.getValues("specifications").length === 0) {
      addSpecification();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Specifications</h3>
        <Button type="button" onClick={addSpecification} size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Specification
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto max-w-full w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No specifications added yet.
                </TableCell>
              </TableRow>
            )}

            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="align-top pt-4">
                  <Controller
                    name={`specifications.${index}.label`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="Warranty" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`specifications.${index}.value`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="10 Years" />
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