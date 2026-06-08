"use client";

import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { MattressSize } from "@/app/generated/prisma/client";
import type { CreateProductInput } from "@/lib/schema/product-form-schema";

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

const STANDARD_THICKNESSES = [4, 6, 8, 10, 12, 14];

import { UseFormReturn } from "react-hook-form";

export function MatrixVariantForm({ form }: { form: UseFormReturn<CreateProductInput> }) {
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedThicknesses, setSelectedThicknesses] = useState<number[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<Record<string, Record<number, number | string>>>({});
  const [mrpMatrix, setMrpMatrix] = useState<Record<string, Record<number, number | string>>>({});

  const allowCustomSize = useWatch({ control: form.control, name: "allowCustomSize" }) || false;
  const customPricing = useWatch({ control: form.control, name: "customSizePricing" }) as Record<string, number> || {};

  // Initialize from existing form values if editing
  useEffect(() => {
    const existingVariants = form.getValues("variants") || [];
    if (existingVariants.length > 0 && selectedSizes.length === 0) {
      const sizes = new Set<string>();
      const thicknesses = new Set<number>();
      const prices: Record<string, Record<number, number>> = {};
      const mrps: Record<string, Record<number, number>> = {};

      existingVariants.forEach(v => {
        if (v.variantType === "MATTRESS") {
          const key = `${v.width}x${v.length}`;
          sizes.add(key);
          thicknesses.add(v.thickness);
          
          if (!prices[key]) prices[key] = {};
          if (!mrps[key]) mrps[key] = {};
          prices[key][v.thickness] = v.salePrice;
          mrps[key][v.thickness] = v.mrp;
        }
      });

      setSelectedSizes(Array.from(sizes));
      setSelectedThicknesses(Array.from(thicknesses));
      setPriceMatrix(prices);
      setMrpMatrix(mrps);
    }
  }, []);

  // Sync to form whenever matrix changes
  useEffect(() => {
    const newVariants: any[] = [];
    let isFirst = true;

    selectedSizes.forEach(sizeKey => {
      const sizeDef = STANDARD_SIZES.find(s => `${s.w}x${s.l}` === sizeKey);
      if (!sizeDef) return;

      selectedThicknesses.forEach(t => {
        const salePrice = Number(priceMatrix[sizeKey]?.[t]) || 0;
        const mrp = Number(mrpMatrix[sizeKey]?.[t]) || 0;

        // Only create variant if price is provided and > 0
        if (salePrice > 0) {
          newVariants.push({
            isDefault: isFirst,
            variantType: "MATTRESS",
            mrp,
            salePrice,
            sizeName: sizeDef.sizeName,
            width: sizeDef.w,
            length: sizeDef.l,
            thickness: t
          });
          isFirst = false;
        }
      });
    });

    form.setValue("variants", newVariants, { shouldValidate: true });
  }, [selectedSizes, selectedThicknesses, priceMatrix, mrpMatrix]);

  const handleSizeToggle = (key: string) => {
    setSelectedSizes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleThicknessToggle = (t: number) => {
    setSelectedThicknesses(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const updatePrice = (sizeKey: string, t: number, val: string) => {
    setPriceMatrix(prev => ({ ...prev, [sizeKey]: { ...(prev[sizeKey] || {}), [t]: val === "" ? "" : Number(val) } }));
  };

  const updateMrp = (sizeKey: string, t: number, val: string) => {
    setMrpMatrix(prev => ({ ...prev, [sizeKey]: { ...(prev[sizeKey] || {}), [t]: val === "" ? "" : Number(val) } }));
  };

  const handleCustomPricingChange = (thickness: number, value: string) => {
    const val = parseFloat(value);
    const current = { ...customPricing };
    if (isNaN(val)) {
      delete current[thickness.toString()];
    } else {
      current[thickness.toString()] = val;
    }
    form.setValue("customSizePricing", current);
  };

  return (
    <div className="space-y-8">
      {/* Standard Size Matrix */}
      <div className="border rounded-xl p-6 bg-slate-50 space-y-6">
        <h3 className="text-lg font-semibold">Standard Sizes & Pricing</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-3">1. Select Available Sizes</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-white">
              {STANDARD_SIZES.map(s => {
                const key = `${s.w}x${s.l}`;
                return (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`size-${key}`} 
                      checked={selectedSizes.includes(key)}
                      onCheckedChange={() => handleSizeToggle(key)}
                    />
                    <label htmlFor={`size-${key}`} className="text-sm cursor-pointer">{s.label}</label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">2. Select Thicknesses (Inches)</h4>
            <div className="flex flex-wrap gap-4 p-2">
              {STANDARD_THICKNESSES.map(t => (
                <div key={t} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`thick-${t}`} 
                    checked={selectedThicknesses.includes(t)}
                    onCheckedChange={() => handleThicknessToggle(t)}
                  />
                  <label htmlFor={`thick-${t}`} className="text-sm cursor-pointer">{t}"</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedSizes.length > 0 && selectedThicknesses.length > 0 && (
          <div className="pt-6 border-t overflow-x-auto">
            <h4 className="font-medium mb-4">3. Pricing Matrix</h4>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 border rounded-tl-md">Size</th>
                  {selectedThicknesses.sort((a,b)=>a-b).map(t => (
                    <th key={t} className="px-4 py-2 border text-center">{t}" Thickness</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedSizes.map(sizeKey => {
                  const label = STANDARD_SIZES.find(s => `${s.w}x${s.l}` === sizeKey)?.label;
                  return (
                    <tr key={sizeKey} className="bg-white">
                      <td className="px-4 py-2 border font-medium">{label}</td>
                      {selectedThicknesses.sort((a,b)=>a-b).map(t => (
                        <td key={t} className="px-4 py-2 border">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-8">MRP:</span>
                              <Input 
                                type="number" 
                                value={!mrpMatrix[sizeKey]?.[t] || Number(mrpMatrix[sizeKey]?.[t]) === 0 ? "" : mrpMatrix[sizeKey]?.[t]} 
                                onChange={(e) => updateMrp(sizeKey, t, e.target.value)}
                                className="h-8"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-8">Sale:</span>
                              <Input 
                                type="number" 
                                value={!priceMatrix[sizeKey]?.[t] || Number(priceMatrix[sizeKey]?.[t]) === 0 ? "" : priceMatrix[sizeKey]?.[t]} 
                                onChange={(e) => updatePrice(sizeKey, t, e.target.value)}
                                className="h-8 border-primary"
                                placeholder="Optional"
                              />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Size Settings */}
      <div className="border rounded-xl p-6 bg-slate-50 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Custom Size Configuration</h3>
            <p className="text-sm text-muted-foreground">Allow customers to order custom dimensions.</p>
          </div>
          <Switch 
            checked={allowCustomSize} 
            onCheckedChange={(val) => {
              form.setValue("allowCustomSize", val, { shouldValidate: true });
              if (val) {
                if (!form.getValues("minWidth")) form.setValue("minWidth", 30, { shouldValidate: true });
                if (!form.getValues("maxWidth")) form.setValue("maxWidth", 72, { shouldValidate: true });
                if (!form.getValues("minLength")) form.setValue("minLength", 72, { shouldValidate: true });
                if (!form.getValues("maxLength")) form.setValue("maxLength", 84, { shouldValidate: true });
              }
            }} 
          />
        </div>

        {allowCustomSize && (
          <div className="space-y-6 pt-4 border-t">
            <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-md">
              Default values cover most Single, Double, Queen, King, and standard custom mattress sizes. You can adjust these limits for this mattress.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Min Width (Inches)</Label>
                <Input type="number" {...form.register("minWidth", { valueAsNumber: true })} />
                {form.formState.errors.minWidth && <p className="text-xs text-destructive">{form.formState.errors.minWidth.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Max Width (Inches)</Label>
                <Input type="number" {...form.register("maxWidth", { valueAsNumber: true })} />
                {form.formState.errors.maxWidth && <p className="text-xs text-destructive">{form.formState.errors.maxWidth.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Min Length (Inches)</Label>
                <Input type="number" {...form.register("minLength", { valueAsNumber: true })} />
                {form.formState.errors.minLength && <p className="text-xs text-destructive">{form.formState.errors.minLength.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Max Length (Inches)</Label>
                <Input type="number" {...form.register("maxLength", { valueAsNumber: true })} />
                {form.formState.errors.maxLength && <p className="text-xs text-destructive">{form.formState.errors.maxLength.message as string}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Per Sq.Ft Pricing by Thickness</h4>
              <p className="text-sm text-muted-foreground">Set the price per square foot for each allowed custom thickness.</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {STANDARD_THICKNESSES.map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <Label className="w-12 text-right">{t}"</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                      <Input 
                        type="number"
                        className="pl-7"
                        placeholder="Rate / Sq.Ft"
                        value={customPricing[t.toString()] || ""}
                        onChange={(e) => handleCustomPricingChange(t, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
