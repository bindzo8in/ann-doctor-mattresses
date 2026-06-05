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
import { Textarea } from "@/components/ui/textarea";

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

  function addFaq() {
    append({
      question: "",
      answer: "",
    });
  }

  useEffect(() => {
    if (form.getValues("faqs").length === 0) {
      addFaq();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
        <Button type="button" onClick={addFaq} size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto max-w-full w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No FAQs added yet.
                </TableCell>
              </TableRow>
            )}

            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="align-top pt-4">
                  <Controller
                    name={`faqs.${index}.question`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input {...field} placeholder="e.g. Do you offer warranty?" />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`faqs.${index}.answer`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Textarea
                          {...field}
                          className="min-h-[80px]"
                          placeholder="Yes, all products come with a 1-year warranty."
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