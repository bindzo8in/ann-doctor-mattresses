"use client";

import { useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";

import type { UseFormReturn } from "react-hook-form";
import type { CreateProductInput } from "@/lib/schema/product-form-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  useEffect(() => {
    const currentVariants = form.getValues("variants") || [];
    const hasMismatchedVariants = currentVariants.some(
      (v: any) => v.variantType !== "SOFA"
    );

    if (currentVariants.length === 0 || hasMismatchedVariants) {
      if (hasMismatchedVariants) {
        remove(); // Clear all fields
      }
      addVariant();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addVariant() {
    append({
      variantType: "SOFA",
      seatCount: 1,
      material: "",
      shape: "STRAIGHT",
      mrp: 0,
      salePrice: 1,
      isDefault: fields.length === 0,
    });
  }

  function handleDuplicate(index: number) {
    const variant = form.getValues(`variants.${index}`);
    if (variant.variantType !== "SOFA") return; // type narrowing safety
    
    append({
      ...variant,
      isDefault: false,
    });
  }

  function handleDelete(index: number) {
    if (fields.length === 1) return;

    const wasDefault = form.getValues(`variants.${index}.isDefault`);
    remove(index);

    if (wasDefault) {
      const remaining = form.getValues("variants");
      if (remaining.length > 0) {
        form.setValue("variants.0.isDefault", true, { shouldValidate: true });
      }
    }
  }

  function handleDefaultChange(index: number) {
    const variants = form.getValues("variants");
    variants.forEach((_, i) => {
      form.setValue(`variants.${i}.isDefault`, i === index, { shouldValidate: true });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Sofa Variants <Badge variant="secondary" className="ml-2">{fields.length}</Badge>
        </h3>

        <Button type="button" onClick={addVariant} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <div className="rounded-md border w-full max-w-full overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px] text-center">Default</TableHead>
              <TableHead className="w-[150px]">Seat Count</TableHead>
              <TableHead className="w-[150px]">Material</TableHead>
              <TableHead className="w-[150px]">Shape</TableHead>
              <TableHead className="w-[120px]">MRP</TableHead>
              <TableHead className="w-[120px]">Sale Price</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center align-top pt-4">
                  <Controller
                    name={`variants.${index}.isDefault`}
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex justify-center items-center h-[40px]">
                        <input
                          type="radio"
                          className="w-4 h-4 accent-primary cursor-pointer"
                          checked={field.value}
                          onChange={() => handleDefaultChange(index)}
                        />
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`variants.${index}.seatCount`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <div className="flex flex-col gap-1 relative mt-1">
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
                            className={fieldState.invalid ? "border-destructive w-full" : "w-full"}
                          />
                          {form.watch(`variants.${index}.isDefault`) && (
                            <Badge variant="default" className="text-[10px] px-1.5 h-4 absolute -top-2.5 -right-2 z-10 pointer-events-none">Default</Badge>
                          )}
                        </div>
                        {fieldState.error && (
                          <p className="text-[10px] text-destructive whitespace-normal break-words max-w-[150px]">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`variants.${index}.material`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Input 
                          {...field} 
                          className={fieldState.invalid ? "border-destructive" : ""} 
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-destructive whitespace-normal break-words max-w-[150px]">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`variants.${index}.shape`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={fieldState.invalid ? "border-destructive" : ""}>
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
                        {fieldState.error && (
                          <p className="text-[10px] text-destructive whitespace-normal break-words max-w-[150px]">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`variants.${index}.mrp`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
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
                          className={fieldState.invalid ? "border-destructive" : ""}
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-destructive whitespace-normal break-words max-w-[150px]">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <Controller
                    name={`variants.${index}.salePrice`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
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
                          className={fieldState.invalid ? "border-destructive" : ""}
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-destructive whitespace-normal break-words max-w-[150px]">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TableCell>

                <TableCell className="align-top pt-4">
                  <div className="flex items-center justify-center gap-1 h-[40px]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDuplicate(index)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      onClick={() => handleDelete(index)}
                      disabled={fields.length === 1}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
