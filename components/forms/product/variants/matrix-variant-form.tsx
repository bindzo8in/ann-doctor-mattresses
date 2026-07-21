"use client";

import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { MattressSize } from "@/app/generated/prisma/client";
import type { CreateProductInput } from "@/lib/schema/product-form-schema";
import { formatPrice, roundPrice } from "@/lib/price";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings2, Star, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

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

const STANDARD_THICKNESSES = [4, 5, 6, 7, 8, 9, 10, 12, 14];

import { UseFormReturn } from "react-hook-form";

export function MatrixVariantForm({ form }: { form: UseFormReturn<CreateProductInput> }) {
  
  const customPricing = useWatch({ control: form.control, name: "customSizePricing" }) as Record<string, number> || {};
  const mrpPricing = useWatch({ control: form.control, name: "customSizeMrpPricing" }) as Record<string, number> || {};
  
  // Base rate inputs for auto-populating rates per Sq.Ft per Inch
  const [baseMrpPerSqFtPerInch, setBaseMrpPerSqFtPerInch] = useState<number | "">(
    () => form.getValues("baseMrpPerSqFtPerInch") ?? ""
  );
  const [baseSalePricePerSqFtPerInch, setBaseSalePricePerSqFtPerInch] = useState<number | "">(
    () => form.getValues("baseSalePricePerSqFtPerInch") ?? ""
  );

  // Which standard sizes are active
  const [selectedSizes, setSelectedSizes] = useState<string[]>(STANDARD_SIZES.map(s => `${s.w}x${s.l}`));
  
  // Which standard thicknesses are active/selected
  const [selectedThicknesses, setSelectedThicknesses] = useState<number[]>(() => {
    const pricingKeys = Object.keys(customPricing).map(Number).filter(t => !isNaN(t));
    if (pricingKeys.length > 0) return pricingKeys;
    return STANDARD_THICKNESSES;
  });
  const [hasInitializedThicknesses, setHasInitializedThicknesses] = useState(false);

  const [hasCalculatedMrp, setHasCalculatedMrp] = useState(false);
  const [hasInitializedOverrides, setHasInitializedOverrides] = useState(false);

  const [defaultVariantKey, setDefaultVariantKey] = useState<string>("");
  const [priceOverrides, setPriceOverrides] = useState<Record<string, { mrp?: number | string, salePrice?: number | string }>>({});
  
  const [customDefaultWidth, setCustomDefaultWidth] = useState<number | "">("");
  const [customDefaultLength, setCustomDefaultLength] = useState<number | "">("");

  // Initialization and reverse-calculation
  const existingVariants = useWatch({ control: form.control, name: "variants" });
  
  useEffect(() => {
    if (!hasInitializedThicknesses) {
      const pricingKeys = Object.keys(customPricing).map(Number).filter(t => !isNaN(t));
      if (pricingKeys.length > 0) {
        setSelectedThicknesses(pricingKeys.sort((a, b) => a - b));
        setHasInitializedThicknesses(true);
      } else if (existingVariants && existingVariants.length > 0) {
        const existingThicks = new Set<number>();
        existingVariants.forEach(v => {
          if (v.variantType === "MATTRESS" && v.thickness) existingThicks.add(v.thickness);
        });
        if (existingThicks.size > 0) {
          setSelectedThicknesses(Array.from(existingThicks).sort((a, b) => a - b));
          setHasInitializedThicknesses(true);
        }
      }
    }
  }, [customPricing, existingVariants, hasInitializedThicknesses]);

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
    let derivedMrp: Record<string, number> = {};
    if (existingVariants && existingVariants.length > 0 && !hasCalculatedMrp && Object.keys(mrpPricing).length === 0) {
      existingVariants.forEach(v => {
        if (v.variantType === "MATTRESS" && v.mrp && v.width && v.length) {
          const area = (v.width * v.length) / 144;
          if (area > 0 && !derivedMrp[v.thickness!.toString()]) {
            derivedMrp[v.thickness!.toString()] = Number((v.mrp / area).toFixed(2));
          }
        }
      });
      if (Object.keys(derivedMrp).length > 0) {
        form.setValue("customSizeMrpPricing", derivedMrp, { shouldValidate: true });
        setHasCalculatedMrp(true);
      }
    }

    // Initialize overrides and default variant
    const currentCustomPricing = (form.getValues("customSizePricing") as Record<string, number>) || customPricing;
    const currentMrpPricing = (form.getValues("customSizeMrpPricing") as Record<string, number>) || mrpPricing;
    const hasPricingData = Object.keys(currentCustomPricing).length > 0;

    if (existingVariants && existingVariants.length > 0 && !hasInitializedOverrides && hasPricingData) {
       const initialOverrides: Record<string, { mrp?: number, salePrice?: number }> = {};
       let initialDefault = "";
       
       existingVariants.forEach(v => {
          if (v.variantType === "MATTRESS" && v.width && v.length && v.thickness) {
             const key = v.sizeName === "CUSTOM" ? `CUSTOM-${v.thickness}` : `${v.width}x${v.length}-${v.thickness}`;
             if (v.isDefault) initialDefault = key;
             
             if (v.sizeName === "CUSTOM") {
                setCustomDefaultWidth(v.width);
                setCustomDefaultLength(v.length);
             }
             
             const areaSqFt = (v.width * v.length) / 144;
             const sqftSale = currentCustomPricing[v.thickness.toString()];
             const sqftMrp = currentMrpPricing[v.thickness.toString()] || derivedMrp[v.thickness.toString()];
             
             if (sqftSale && sqftSale > 0) {
                const expectedSale = roundPrice(areaSqFt * sqftSale);
                const expectedMrp = sqftMrp && sqftMrp > 0 ? roundPrice(areaSqFt * sqftMrp) : expectedSale;
                
                // Only mark as manual override if stored price differs from the roundoff value calculated from rate
                if (v.salePrice !== expectedSale || v.mrp !== expectedMrp) {
                   initialOverrides[key] = { mrp: v.mrp, salePrice: v.salePrice };
                }
             }
          }
       });
       
       setPriceOverrides(initialOverrides);
       if (initialDefault) setDefaultVariantKey(initialDefault);
       setHasInitializedOverrides(true);
    }
  }, [existingVariants, hasCalculatedMrp, mrpPricing, customPricing, form, hasInitializedOverrides]);

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

  const handleThicknessToggle = (thickness: number) => {
    setSelectedThicknesses(prev => {
      const isSelected = prev.includes(thickness);
      if (isSelected) {
        const newCustom = { ...customPricing };
        delete newCustom[thickness.toString()];
        form.setValue("customSizePricing", newCustom, { shouldValidate: true });

        const newMrp = { ...mrpPricing };
        delete newMrp[thickness.toString()];
        form.setValue("customSizeMrpPricing", newMrp, { shouldValidate: true });

        return prev.filter(t => t !== thickness);
      } else {
        const updated = [...prev, thickness].sort((a, b) => a - b);
        // If base rates are populated, automatically set rates for newly selected thickness
        if (baseSalePricePerSqFtPerInch !== "" && !isNaN(Number(baseSalePricePerSqFtPerInch))) {
          const newCustom = { ...customPricing, [thickness.toString()]: Number(baseSalePricePerSqFtPerInch) * thickness };
          form.setValue("customSizePricing", newCustom, { shouldValidate: true });
        }
        if (baseMrpPerSqFtPerInch !== "" && !isNaN(Number(baseMrpPerSqFtPerInch))) {
          const newMrp = { ...mrpPricing, [thickness.toString()]: Number(baseMrpPerSqFtPerInch) * thickness };
          form.setValue("customSizeMrpPricing", newMrp, { shouldValidate: true });
        }
        return updated;
      }
    });
  };

  const handleSelectAllThicknesses = () => {
    setSelectedThicknesses(STANDARD_THICKNESSES);
  };

  const handleDeselectAllThicknesses = () => {
    setSelectedThicknesses([]);
    form.setValue("customSizePricing", {}, { shouldValidate: true });
    form.setValue("customSizeMrpPricing", {}, { shouldValidate: true });
  };

  const handleApplyBaseRates = () => {
    setPriceOverrides({}); // Clear manual overrides when auto-populating new base rates
    const salePerInch = typeof baseSalePricePerSqFtPerInch === "number" ? baseSalePricePerSqFtPerInch : parseFloat(baseSalePricePerSqFtPerInch as string);
    const mrpPerInch = typeof baseMrpPerSqFtPerInch === "number" ? baseMrpPerSqFtPerInch : parseFloat(baseMrpPerSqFtPerInch as string);

    const updatedCustomPricing = { ...customPricing };
    const updatedMrpPricing = { ...mrpPricing };

    selectedThicknesses.forEach(t => {
      if (!isNaN(salePerInch) && salePerInch > 0) {
        updatedCustomPricing[t.toString()] = salePerInch * t;
      }
      if (!isNaN(mrpPerInch) && mrpPerInch > 0) {
        updatedMrpPricing[t.toString()] = mrpPerInch * t;
      }
    });

    if (!isNaN(salePerInch) && salePerInch > 0) {
      form.setValue("customSizePricing", updatedCustomPricing, { shouldValidate: true });
    }
    if (!isNaN(mrpPerInch) && mrpPerInch > 0) {
      form.setValue("customSizeMrpPricing", updatedMrpPricing, { shouldValidate: true });
    }
  };

  const handleRecalculateMatrix = () => {
    setPriceOverrides({});
    toast.success("Recalculated all matrix variant prices from rates.");
  };

  const handleSizeToggle = (key: string) => {
    setSelectedSizes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // Sync auto-calculated variants to the form
  useEffect(() => {
    const newVariants: any[] = [];
    let isFirst = true;

    // Create a map of existing IDs to prevent recreating variants unnecessarily
    const existingMap = new Map<string, string>();
    if (existingVariants && Array.isArray(existingVariants)) {
      existingVariants.forEach(v => {
        if (v.variantType === "MATTRESS" && v.width && v.length && v.thickness && v.id) {
          if (v.sizeName === "CUSTOM") {
            existingMap.set(`CUSTOM-${v.thickness}`, v.id);
          } else {
            existingMap.set(`${v.width}x${v.length}-${v.thickness}`, v.id);
          }
        }
      });
    }

    // Only process thicknesses that are selected AND have a defined Sale rate
    const activeThicknesses = selectedThicknesses.filter(t => !isNaN(t) && customPricing[t.toString()] > 0);

    selectedSizes.forEach(sizeKey => {
      const sizeDef = STANDARD_SIZES.find(s => `${s.w}x${s.l}` === sizeKey);
      if (!sizeDef) return;

      const areaSqFt = (sizeDef.w * sizeDef.l) / 144;

      activeThicknesses.forEach(t => {
        const key = `${sizeDef.w}x${sizeDef.l}-${t}`;
        
        const saleRate = customPricing[t.toString()];
        const mrpRate = mrpPricing[t.toString()] || saleRate; // Fallback to sale rate if no MRP

        let salePrice = roundPrice(areaSqFt * saleRate);
        let mrpPrice = roundPrice(areaSqFt * mrpRate);
        
        if (priceOverrides[key]) {
           const oSale = priceOverrides[key].salePrice;
           const oMrp = priceOverrides[key].mrp;
           if (oSale !== undefined && oSale !== "") {
             const pSale = typeof oSale === "number" ? oSale : parseFloat(oSale as string);
             if (!isNaN(pSale)) salePrice = pSale;
           }
           if (oMrp !== undefined && oMrp !== "") {
             const pMrp = typeof oMrp === "number" ? oMrp : parseFloat(oMrp as string);
             if (!isNaN(pMrp)) mrpPrice = pMrp;
           }
        }
        
        let isDefault = isFirst;
        if (defaultVariantKey) {
            isDefault = defaultVariantKey === key;
        }

        const existingId = existingMap.get(key);

        newVariants.push({
          ...(existingId ? { id: existingId } : {}),
          isDefault: isDefault,
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

    const allowCustomSize = form.getValues("allowCustomSize");
    if (allowCustomSize && activeThicknesses.length > 0) {
      const minW = form.getValues("minWidth") || 30;
      const minL = form.getValues("minLength") || 70;
      const tStr = defaultVariantKey?.startsWith("CUSTOM") ? defaultVariantKey.split("-")[1] : activeThicknesses[0]?.toString();
      const t = parseInt(tStr || "") || activeThicknesses[0];
      const key = `CUSTOM-${t}`;
      
      let isDefault = defaultVariantKey === key || defaultVariantKey?.startsWith("CUSTOM");
      const existingId = existingMap.get(key);

      const w = customDefaultWidth || minW;
      const l = customDefaultLength || minL;
      
      const areaSqFt = (w * l) / 144;
      const saleRate = customPricing[t.toString()] || 0;
      const mrpRate = mrpPricing[t.toString()] || saleRate;
      
      const salePrice = roundPrice(areaSqFt * saleRate);
      const mrpPrice = roundPrice(areaSqFt * mrpRate);

      newVariants.push({
        ...(existingId ? { id: existingId } : {}),
        isDefault: isDefault,
        variantType: "MATTRESS",
        mrp: mrpPrice,
        salePrice: salePrice,
        sizeName: "CUSTOM",
        width: w,
        length: l,
        thickness: t
      });
    }

    form.setValue("variants", newVariants, { shouldValidate: true });
  }, [customPricing, mrpPricing, selectedSizes, selectedThicknesses, form, priceOverrides, defaultVariantKey, customDefaultWidth, customDefaultLength]);

  const activeThicknesses = selectedThicknesses.filter(t => !isNaN(t) && customPricing[t.toString()] > 0).sort((a,b)=>a-b);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Pricing Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Select which thicknesses are available and enter the Per Square Feet rate for each. All standard variants will be automatically calculated.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllThicknesses}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAllThicknesses}
              className="text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>

        {/* Auto-populate base rate section */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Auto-Calculate Rates (per Sq.Ft / Inch)
            </h4>
            <p className="text-xs text-muted-foreground">
              Enter base rate per Sq.Ft per inch of thickness to automatically populate all selected thickness cards (e.g., 6" rate = 6 × Base Rate).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-1">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Base MRP (per Sq.Ft / Inch)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                <Input 
                  type="number"
                  className="pl-7 text-sm"
                  placeholder="e.g., 150"
                  value={baseMrpPerSqFtPerInch}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                    setBaseMrpPerSqFtPerInch(val);
                    form.setValue("baseMrpPerSqFtPerInch", val === "" ? null : val, { shouldValidate: true });
                    if (val !== "" && !isNaN(Number(val))) {
                      const updatedMrp = { ...mrpPricing };
                      selectedThicknesses.forEach(t => {
                        updatedMrp[t.toString()] = Number(val) * t;
                      });
                      form.setValue("customSizeMrpPricing", updatedMrp, { shouldValidate: true });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Base Sale Price (per Sq.Ft / Inch)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                <Input 
                  type="number"
                  className="pl-7 text-sm border-primary"
                  placeholder="e.g., 100"
                  value={baseSalePricePerSqFtPerInch}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                    setBaseSalePricePerSqFtPerInch(val);
                    form.setValue("baseSalePricePerSqFtPerInch", val === "" ? null : val, { shouldValidate: true });
                    if (val !== "" && !isNaN(Number(val))) {
                      const updatedCustom = { ...customPricing };
                      selectedThicknesses.forEach(t => {
                        updatedCustom[t.toString()] = Number(val) * t;
                      });
                      form.setValue("customSizePricing", updatedCustom, { shouldValidate: true });
                    }
                  }}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs font-medium gap-1.5"
              onClick={handleApplyBaseRates}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Auto-Populate Rates
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STANDARD_THICKNESSES.map(t => {
            const isSelected = selectedThicknesses.includes(t);
            return (
              <div 
                key={t} 
                className={`p-4 rounded-lg border transition-all space-y-4 ${
                  isSelected ? "bg-white border-slate-300 shadow-sm" : "bg-slate-100/70 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`thick-${t}`}
                      checked={isSelected}
                      onCheckedChange={() => handleThicknessToggle(t)}
                    />
                    <label 
                      htmlFor={`thick-${t}`} 
                      className="font-semibold text-sm cursor-pointer select-none"
                    >
                      {t}" Thickness
                    </label>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                    {isSelected ? 'Available' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">MRP per Sq.Ft</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                      <Input 
                        type="number"
                        className="pl-7"
                        placeholder="e.g., 1500"
                        disabled={!isSelected}
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
                        disabled={!isSelected}
                        value={customPricing[t.toString()] || ""}
                        onChange={(e) => handleSalePriceChange(t, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Custom Size Default Option */}
      {form.getValues("allowCustomSize") && activeThicknesses.length > 0 && (
        <div className="border rounded-xl p-6 bg-slate-50 space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Custom Size Default</h3>
              <p className="text-sm text-muted-foreground">Select this if you want the "Custom Size" option to be selected by default when customers view this product.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRecalculateMatrix}
                className="text-xs gap-1.5 bg-white hover:bg-slate-50 border-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5 text-primary" /> Recalculate
              </Button>
              <button 
                type="button"
                onClick={() => setDefaultVariantKey(`CUSTOM-${activeThicknesses[0]}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all shrink-0 ${defaultVariantKey?.startsWith("CUSTOM") ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white hover:bg-slate-50'}`}
              >
                <Star className="h-4 w-4" fill={defaultVariantKey?.startsWith("CUSTOM") ? "currentColor" : "none"} />
                <span className="font-medium">Set as Default</span>
              </button>
            </div>
          </div>
          
          {defaultVariantKey?.startsWith("CUSTOM") && (() => {
            const tStr = defaultVariantKey.split("-")[1];
            const t = parseInt(tStr || "") || activeThicknesses[0];
            const w = customDefaultWidth || form.getValues("minWidth") || 30;
            const l = customDefaultLength || form.getValues("minLength") || 70;
            const areaSqFt = (w * l) / 144;
            const saleRate = customPricing[t.toString()] || 0;
            const mrpRate = mrpPricing[t.toString()] || saleRate;
            const salePrice = roundPrice(areaSqFt * saleRate);
            const mrpPrice = roundPrice(areaSqFt * mrpRate);

            return (
              <div className="pt-4 border-t flex flex-col md:flex-row gap-6 items-start md:items-end w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full max-w-2xl">
                   <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Default Thickness</Label>
                      <select 
                         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                         value={t}
                         onChange={(e) => setDefaultVariantKey(`CUSTOM-${e.target.value}`)}
                      >
                         {activeThicknesses.map(thick => (
                            <option key={thick} value={thick}>{thick} Inches</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Default Length (Inches)</Label>
                      <Input 
                         type="number"
                         placeholder={`Default: ${form.getValues("minLength") || 70}`}
                         value={customDefaultLength === "" ? "" : customDefaultLength}
                         onChange={(e) => setCustomDefaultLength(e.target.value ? parseInt(e.target.value) : "")}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Default Width (Inches)</Label>
                      <Input 
                         type="number"
                         placeholder={`Default: ${form.getValues("minWidth") || 30}`}
                         value={customDefaultWidth === "" ? "" : customDefaultWidth}
                         onChange={(e) => setCustomDefaultWidth(e.target.value ? parseInt(e.target.value) : "")}
                      />
                   </div>
                </div>

                <div className="bg-white px-6 py-3 rounded-lg border shadow-sm flex flex-col items-center justify-center shrink-0 min-w-[150px]">
                   <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Calculated Price</span>
                   <span className="font-bold text-green-600 text-lg">₹{formatPrice(salePrice)}</span>
                   {mrpPrice > salePrice && (
                     <span className="text-xs text-slate-400 line-through">₹{formatPrice(mrpPrice)}</span>
                   )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Auto-Calculated Preview */}
      {activeThicknesses.length > 0 && selectedSizes.length > 0 && (
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-100 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">Variants Matrix</h3>
              <p className="text-xs text-slate-500">Hover over a price to override it manually, or click the star to set a variant as Default.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecalculateMatrix}
              className="text-xs gap-1.5 shrink-0 bg-white hover:bg-slate-50 border-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" /> Recalculate Matrix
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[150px]">Size</TableHead>
                  {/* <TableHead>Area</TableHead> */}
                  {activeThicknesses.map(t => (
                    <TableHead key={t} className="text-center">{t}" Thick</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {STANDARD_SIZES.filter(s => selectedSizes.includes(`${s.w}x${s.l}`)).map(sizeDef => {
                  const area = (sizeDef.w * sizeDef.l) / 144;
                  return (
                    <TableRow key={sizeDef.label}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {sizeDef.label}
                        <div className="text-[10px] text-muted-foreground">{area.toFixed(2)} Sq.Ft</div>
                      </TableCell>
                      {/* <TableCell className="text-slate-500">{area.toFixed(2)}</TableCell> */}
                      {activeThicknesses.map(t => {
                        const key = `${sizeDef.w}x${sizeDef.l}-${t}`;
                        const isOverridden = !!priceOverrides[key];
                        
                        const baseSale = roundPrice(area * (customPricing[t.toString()] || 0));
                        const baseMrp = roundPrice(area * (mrpPricing[t.toString()] || customPricing[t.toString()] || 0));

                        let sale = baseSale;
                        let mrp = baseMrp;
                        
                        if (isOverridden) {
                            const oSale = priceOverrides[key].salePrice;
                            const oMrp = priceOverrides[key].mrp;
                            if (oSale !== undefined && oSale !== "") {
                              const parsedSale = typeof oSale === "number" ? oSale : parseFloat(oSale as string);
                              if (!isNaN(parsedSale)) sale = parsedSale;
                            }
                            if (oMrp !== undefined && oMrp !== "") {
                              const parsedMrp = typeof oMrp === "number" ? oMrp : parseFloat(oMrp as string);
                              if (!isNaN(parsedMrp)) mrp = parsedMrp;
                            }
                        }
                        
                        // Set the first variant as default fallback if nothing is selected
                        const isFirstGenerated = defaultVariantKey === "" && sizeDef === STANDARD_SIZES.filter(s => selectedSizes.includes(`${s.w}x${s.l}`))[0] && t === activeThicknesses[0];
                        const isDefault = defaultVariantKey === key || isFirstGenerated;

                        return (
                          <TableCell key={t} className="text-center group relative border-l">
                            <div className="flex flex-col items-center justify-center gap-1 min-h-[50px] relative">
                              {/* Set Default Button */}
                              <button 
                                 type="button"
                                 onClick={() => setDefaultVariantKey(key)}
                                 className={`absolute left-0 top-1/2 -translate-y-1/2 transition-opacity ${isDefault ? 'text-yellow-500 opacity-100' : 'text-slate-200 opacity-0 group-hover:opacity-100 hover:text-yellow-400'}`}
                                 title="Set as Default Variant"
                              >
                                 <Star className="h-4 w-4" fill={isDefault ? "currentColor" : "none"} />
                              </button>

                              <div className="flex items-center gap-1">
                                 <div className="flex flex-col items-center">
                                    <span className="font-bold text-green-600 flex items-center gap-1">
                                      ₹{formatPrice(sale)}
                                      {isOverridden && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Custom Price Override" />
                                      )}
                                    </span>
                                    {mrp > sale && (
                                      <span className="text-xs text-slate-400 line-through">₹{formatPrice(mrp)}</span>
                                    )}
                                 </div>
                                 
                                 <Popover>
                                   <PopoverTrigger asChild>
                                     <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 bg-white shadow-sm border rounded p-1 absolute right-0 top-1/2 -translate-y-1/2 z-10">
                                       <Settings2 className="h-3.5 w-3.5" />
                                     </button>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-64 p-4 space-y-4">
                                      <h4 className="font-semibold text-sm border-b pb-2">Override Pricing</h4>
                                      <p className="text-xs text-muted-foreground font-medium">Size: {sizeDef.label} - {t}" Thick</p>
                                      
                                      <div className="space-y-3">
                                         <div className="space-y-1">
                                            <Label className="text-xs">MRP (₹)</Label>
                                            <Input 
                                               type="number" 
                                               value={priceOverrides[key]?.mrp !== undefined ? priceOverrides[key].mrp : baseMrp} 
                                               onChange={(e) => {
                                                  const val = e.target.value;
                                                  setPriceOverrides(prev => ({
                                                     ...prev,
                                                     [key]: {
                                                         ...prev[key],
                                                         mrp: val === "" ? "" : (isNaN(parseFloat(val)) ? val : parseFloat(val))
                                                     }
                                                  }));
                                               }}
                                            />
                                         </div>
                                         <div className="space-y-1">
                                            <Label className="text-xs">Sale Price (₹)</Label>
                                            <Input 
                                               type="number" 
                                               value={priceOverrides[key]?.salePrice !== undefined ? priceOverrides[key].salePrice : baseSale} 
                                               onChange={(e) => {
                                                  const val = e.target.value;
                                                  setPriceOverrides(prev => ({
                                                     ...prev,
                                                     [key]: {
                                                         ...prev[key],
                                                         salePrice: val === "" ? "" : (isNaN(parseFloat(val)) ? val : parseFloat(val))
                                                     }
                                                  }));
                                               }}
                                            />
                                         </div>
                                      </div>
                                      
                                      <div className="flex justify-between items-center pt-3 border-t">
                                         <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-xs text-red-500 hover:text-red-600 h-8 px-2"
                                            onClick={() => {
                                                const next = {...priceOverrides};
                                                delete next[key];
                                                setPriceOverrides(next);
                                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                                            }}
                                         >
                                            Reset
                                         </Button>
                                         <Button 
                                            type="button"
                                            size="sm"
                                            className="text-xs h-8 px-3"
                                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                                         >
                                            Done
                                         </Button>
                                      </div>
                                   </PopoverContent>
                                 </Popover>
                              </div>
                              
                              {isOverridden && (
                                <span className="text-[9px] text-orange-500 leading-none bg-orange-50 px-1 rounded">Manually Overridden</span>
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

