"use client";

import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { MattressSize } from "@/app/generated/prisma/client";
import type { CreateProductInput } from "@/lib/schema/product-form-schema";
import { formatPrice } from "@/lib/price";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STANDARD_SIZES: { label: string, sizeName: MattressSize, w: number, l: number }[] = [
  { label: "Single 36x72", sizeName: "SINGLE", w: 36, l: 72 },
  { label: "Single 36x75", sizeName: "SINGLE", w: 36, l: 75 },
  { label: "Single 36x78", sizeName: "SINGLE", w: 36, l: 78 },
  { label: "Double 48x72", sizeName: "DOUBLE", w: 48, l: 72 },
  { label: "Double 48x75", sizeName: "DOUBLE", w: 48, l: 75 },
  { label: "Double 48x78", sizeName: "DOUBLE", w: 48, l: 78 },
  { label: "Queen 60x72", sizeName: "QUEEN", w: 60, l: 72 },
  { label: "Queen 60x75", sizeName: "QUEEN", w: 60, l: 75 },
  { label: "Queen 60x78", sizeName: "QUEEN", w: 60, l: 78 },
  { label: "King 72x72", sizeName: "KING", w: 72, l: 72 },
  { label: "King 72x75", sizeName: "KING", w: 72, l: 75 },
  { label: "King 72x78", sizeName: "KING", w: 72, l: 78 },
  { label: "King 72x84", sizeName: "KING", w: 72, l: 84 },
];

const STANDARD_THICKNESSES = [4, 5, 6, 8, 10, 12, 14];

import { UseFormReturn } from "react-hook-form";

export function MatrixVariantForm({ form }: { form: UseFormReturn<CreateProductInput> }) {
  
  const customPricing = useWatch({ control: form.control, name: "customSizePricing" }) as Record<string, number> || {};
  const mrpPricing = useWatch({ control: form.control, name: "customSizeMrpPricing" }) as Record<string, number> || {};
  
  // Which standard sizes are active
  const [selectedSizes, setSelectedSizes] = useState<string[]>(STANDARD_SIZES.map(s => `${s.w}x${s.l}`));
  const [hasCalculatedMrp, setHasCalculatedMrp] = useState(false);

  // Initialization and reverse-calculation
  const existingVariants = useWatch({ control: form.control, name: "variants" });
  useEffect(() => {
    // Force allow custom size to be true as per requirement
    if (form.getValues("allowCustomSize") !== true) {
      form.setValue("allowCustomSize", true, { shouldValidate: true });
    }

    // Default min/max
    if (!form.getValues("minWidth")) form.setValue("minWidth", 30, { shouldValidate: true });
    if (!form.getValues("maxWidth")) form.setValue("maxWidth", 84, { shouldValidate: true });
    if (!form.getValues("minLength")) form.setValue("minLength", 70, { shouldValidate: true });
    if (!form.getValues("maxLength")) form.setValue("maxLength", 84, { shouldValidate: true });

    // Try to reverse calculate MRP per sqft from existing variants if editing
    if (existingVariants && existingVariants.length > 0 && !hasCalculatedMrp && Object.keys(mrpPricing).length === 0) {
      const derivedMrp: Record<string, number> = {};
      existingVariants.forEach(v => {
        if (v.variantType === "MATTRESS" && v.mrp && v.width && v.length) {
          const area = (v.width * v.length) / 144;
          if (area > 0 && !derivedMrp[v.thickness.toString()]) {
            derivedMrp[v.thickness.toString()] = Math.round(v.mrp / area);
          }
        }
      });
      if (Object.keys(derivedMrp).length > 0) {
        form.setValue("customSizeMrpPricing", derivedMrp, { shouldValidate: true });
        setHasCalculatedMrp(true);
      }
    }
  }, [existingVariants, hasCalculatedMrp, mrpPricing, form]);

  const handleSalePriceChange = (thickness: number, value: string) => {
    const val = parseFloat(value);
    const current = { ...customPricing };
    if (isNaN(val)) {
      delete current[thickness.toString()];
    } else {
      current[thickness.toString()] = val;
    }
    form.setValue("customSizePricing", current, { shouldValidate: true });
  };

  const handleMrpPriceChange = (thickness: number, value: string) => {
    const val = parseFloat(value);
    const current = { ...mrpPricing };
    if (isNaN(val)) {
      delete current[thickness.toString()];
    } else {
      current[thickness.toString()] = val;
    }
    form.setValue("customSizeMrpPricing", current, { shouldValidate: true });
  };

  const handleSizeToggle = (key: string) => {
    setSelectedSizes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // Sync auto-calculated variants to the form
  useEffect(() => {
    const newVariants: any[] = [];
    let isFirst = true;

    // Only process thicknesses that have a defined Sale rate
    const activeThicknesses = Object.keys(customPricing).map(Number).filter(t => !isNaN(t) && customPricing[t.toString()] > 0);

    selectedSizes.forEach(sizeKey => {
      const sizeDef = STANDARD_SIZES.find(s => `${s.w}x${s.l}` === sizeKey);
      if (!sizeDef) return;

      const areaSqFt = (sizeDef.w * sizeDef.l) / 144;

      activeThicknesses.forEach(t => {
        const saleRate = customPricing[t.toString()];
        const mrpRate = mrpPricing[t.toString()] || saleRate; // Fallback to sale rate if no MRP

        const salePrice = Math.round(areaSqFt * saleRate);
        const mrpPrice = Math.round(areaSqFt * mrpRate);

        newVariants.push({
          isDefault: isFirst,
          variantType: "MATTRESS",
          mrp: mrpPrice,
          salePrice: salePrice,
          sizeName: sizeDef.sizeName,
          width: sizeDef.w,
          length: sizeDef.l,
          thickness: t
        });
        isFirst = false;
      });
    });

    // We only update if it actually changed to prevent infinite loops
    // In a real robust implementation, deep compare is better, but this suffices for generation
    form.setValue("variants", newVariants, { shouldValidate: true });
  }, [customPricing, mrpPricing, selectedSizes, form]);

  const activeThicknesses = Object.keys(customPricing).map(Number).filter(t => !isNaN(t) && customPricing[t.toString()] > 0).sort((a,b)=>a-b);
  const variantsError = (form.formState.errors.variants as any)?.message;

  return (
    <div className="space-y-8">
      {variantsError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {variantsError}
        </div>
      )}

      {/* Pricing Configuration */}
      <div className="border rounded-xl p-6 bg-slate-50 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Pricing Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Enter the Per Square Feet rate for each thickness you offer. All standard variants will be automatically calculated and saved. Custom size orders will also use these rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STANDARD_THICKNESSES.map(t => (
            <div key={t} className="bg-white p-4 rounded-lg border space-y-4">
              <h4 className="font-semibold text-center border-b pb-2">{t}" Thickness</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">MRP per Sq.Ft</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                    <Input 
                      type="number"
                      className="pl-7"
                      placeholder="e.g., 1500"
                      value={mrpPricing[t.toString()] || ""}
                      onChange={(e) => handleMrpPriceChange(t, e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Sale Price per Sq.Ft</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                    <Input 
                      type="number"
                      className="pl-7 border-primary"
                      placeholder="e.g., 1000"
                      value={customPricing[t.toString()] || ""}
                      onChange={(e) => handleSalePriceChange(t, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Size Selection */}
      <div className="border rounded-xl p-6 bg-slate-50 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Included Standard Sizes</h3>
          <p className="text-sm text-muted-foreground">Uncheck any sizes you do not want to auto-generate variants for.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white border rounded-lg">
          {STANDARD_SIZES.map(s => {
            const key = `${s.w}x${s.l}`;
            return (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox 
                  id={`size-${key}`} 
                  checked={selectedSizes.includes(key)}
                  onCheckedChange={() => handleSizeToggle(key)}
                />
                <label htmlFor={`size-${key}`} className="text-sm font-medium cursor-pointer">{s.label}</label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Calculated Preview */}
      {activeThicknesses.length > 0 && selectedSizes.length > 0 && (
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-100 border-b">
            <h3 className="font-semibold text-slate-800">Auto-Calculated Variants Preview</h3>
            <p className="text-xs text-slate-500">These variants will be permanently saved to the database.</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[200px]">Size</TableHead>
                  <TableHead>Area (Sq.Ft)</TableHead>
                  {activeThicknesses.map(t => (
                    <TableHead key={t} className="text-right">{t}" Thickness</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {STANDARD_SIZES.filter(s => selectedSizes.includes(`${s.w}x${s.l}`)).map(sizeDef => {
                  const area = (sizeDef.w * sizeDef.l) / 144;
                  return (
                    <TableRow key={sizeDef.label}>
                      <TableCell className="font-medium">{sizeDef.label}</TableCell>
                      <TableCell className="text-slate-500">{area.toFixed(2)}</TableCell>
                      {activeThicknesses.map(t => {
                        const sale = Math.round(area * customPricing[t.toString()]);
                        const mrpRate = mrpPricing[t.toString()] || customPricing[t.toString()];
                        const mrp = Math.round(area * mrpRate);
                        return (
                          <TableCell key={t} className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-green-600">₹{formatPrice(sale)}</span>
                              {mrp > sale && (
                                <span className="text-xs text-slate-400 line-through">₹{formatPrice(mrp)}</span>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
