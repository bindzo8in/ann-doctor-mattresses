"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";

import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TagInput } from "@/components/tag-input";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

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

  useEffect(() => {
    if (form.getValues("sections.2.content.guides")?.length === 0) {
      append({
        title: "",
        mattressType: "",
        supportNeeded: "",
        features: [],
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between mt-6 mb-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Guides List</h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            append({
              title: "",
              mattressType: "",
              supportNeeded: "",
              features: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Guide
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto max-w-full w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Title</TableHead>
              <TableHead className="min-w-[150px]">Mattress Type</TableHead>
              <TableHead className="min-w-[150px]">Support Needed</TableHead>
              <TableHead className="min-w-[200px]">Features</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No sleeper guides added yet.
                </TableCell>
              </TableRow>
            )}

            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.2.content.guides.${index}.title`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="Back Sleepers" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.2.content.guides.${index}.mattressType`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="Orthopedic Mattress" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.2.content.guides.${index}.supportNeeded`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="Medium Firm Support" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`sections.2.content.guides.${index}.features`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <TagInput tags={field.value} setTags={field.onChange} />
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
