"use client";

import { useMemo, useState, useEffect } from "react";
import { ProductVariantWithDetails, ProductDetails } from "@/types/product-details";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ChevronDown, Ruler, Minus, Plus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, roundPrice } from "@/lib/price";

interface Props {
  product: ProductDetails;
  variants: ProductVariantWithDetails[];
  selectedVariant: ProductVariantWithDetails;
  onSelect: (variant: ProductVariantWithDetails) => void;
  quantity: number;
  setQuantity: (q: number | ((q: number) => number)) => void;
  isCustomMode: boolean;
  setIsCustomMode: (val: boolean) => void;
  setCustomData: (data: any) => void;
  customData: any;
}

export function MattressVariantSelector({
  product,
  variants,
  selectedVariant,
  onSelect,
  quantity,
  setQuantity,
  isCustomMode,
  setIsCustomMode,
  setCustomData,
  customData
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const currentMattress = selectedVariant?.mattressVariant;
  if (!currentMattress && variants.length > 0) return null;

  const [isOpen, setIsOpen] = useState(false);

  // Modal temporary state
  const [tempCategory, setTempCategory] = useState<string>("SINGLE");
  const [tempThickness, setTempThickness] = useState<number>(6);
  const [tempIsCustom, setTempIsCustom] = useState<boolean>(false);
  const [tempVariant, setTempVariant] = useState<ProductVariantWithDetails | null>(selectedVariant);
  
  // Custom temp state
  const [tempCustomWidth, setTempCustomWidth] = useState<string>("");
  const [tempCustomLength, setTempCustomLength] = useState<string>("");

  const [tempQuantity, setTempQuantity] = useState(quantity);

  const defaultThickness = useMemo(() => {
    const defaultVar = variants.find(v => v.isDefault) || variants[0];
    return defaultVar?.mattressVariant?.thickness || 0;
  }, [variants]);

  // Open handler: initialize state
  useEffect(() => {
    if (isOpen) {
      setTempIsCustom(isCustomMode);
      setTempVariant(selectedVariant);
      setTempQuantity(quantity);
      if (isCustomMode && customData) {
        setTempCategory("CUSTOM");
        setTempThickness(customData.thickness || 6);
        setTempCustomWidth(customData.width?.toString() || "");
        setTempCustomLength(customData.length?.toString() || "");
      } else if (currentMattress) {
        setTempCategory(currentMattress.sizeName);
        setTempThickness(currentMattress.thickness);
      }
    }
  }, [isOpen, isCustomMode, selectedVariant, customData, quantity, currentMattress]);

  // Derived available options
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    variants.forEach(v => {
      if (v.mattressVariant) cats.add(v.mattressVariant.sizeName);
    });
    if (product.allowCustomSize) cats.add("CUSTOM");
    return Array.from(cats);
  }, [variants, product.allowCustomSize]);

  const availableThicknesses = useMemo(() => {
    let thicks: number[] = [];
    if (tempIsCustom) {
      const customPricing = (product.customSizePricing as Record<string, number>) || {};
      thicks = Object.keys(customPricing).map(Number).sort((a,b) => a-b);
    } else {
      const thickSet = new Set<number>();
      variants.forEach(v => {
        if (v.mattressVariant?.sizeName === tempCategory) {
          thickSet.add(v.mattressVariant.thickness);
        }
      });
      thicks = Array.from(thickSet).sort((a,b) => a-b);
    }
    return thicks;
  }, [variants, tempCategory, tempIsCustom, product.customSizePricing]);

  // Handle Category change
  useEffect(() => {
    if (tempCategory === "CUSTOM") {
      setTempIsCustom(true);
      if (!availableThicknesses.includes(tempThickness) && availableThicknesses.length > 0) {
        setTempThickness(availableThicknesses[0]);
      }
    } else {
      setTempIsCustom(false);
      // Auto-select the first available variant in this category
      const variant = variants.find(v => 
        v.mattressVariant?.sizeName === tempCategory && 
        v.mattressVariant?.thickness === tempThickness
      );
      if (variant) {
        setTempVariant(variant);
      } else {
        const fallback = variants.find(v => 
          v.mattressVariant?.sizeName === tempCategory
        );
        if (fallback) {
          setTempVariant(fallback);
          setTempThickness(fallback.mattressVariant!.thickness);
        }
      }
    }
  }, [tempCategory, availableThicknesses]); // Intentionally omitting dependencies to avoid loops, this just reacts to category change

  // Handle Thickness change
  useEffect(() => {
    if (!tempIsCustom) {
      // Find matching variant
      let match = variants.find(v => 
        v.mattressVariant?.sizeName === tempCategory && 
        v.mattressVariant?.length === tempVariant?.mattressVariant?.length &&
        v.mattressVariant?.width === tempVariant?.mattressVariant?.width &&
        v.mattressVariant?.thickness === tempThickness
      );
      if (!match) {
        match = variants.find(v => v.mattressVariant?.sizeName === tempCategory && v.mattressVariant?.thickness === tempThickness);
      }
      if (match) setTempVariant(match);
    }
  }, [tempThickness]);

  // Dimension lists for non-custom
  const availableDimensions = useMemo(() => {
    if (tempIsCustom) return [];
    const dims = new Map<string, { length: number; width: number; isDefault: boolean }>();
    variants.forEach(v => {
      if (v.mattressVariant?.sizeName === tempCategory && v.mattressVariant?.thickness === tempThickness) {
        const key = `${v.mattressVariant.length}x${v.mattressVariant.width}`;
        if (!dims.has(key)) {
          dims.set(key, { length: v.mattressVariant.length, width: v.mattressVariant.width, isDefault: v.isDefault });
        } else if (v.isDefault) {
          dims.set(key, { length: v.mattressVariant.length, width: v.mattressVariant.width, isDefault: true });
        }
      }
    });
    return Array.from(dims.values()).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [variants, tempCategory, tempThickness, tempIsCustom]);

  // Custom Data evaluation
  const minW = product.minWidth || 30;
  const maxW = product.maxWidth || 84;
  const minL = product.minLength || 70;
  const maxL = product.maxLength || 84;
  
  const w = parseFloat(tempCustomWidth);
  const l = parseFloat(tempCustomLength);
  const isValidWidth = !isNaN(w) && w >= minW && w <= maxW;
  const isValidLength = !isNaN(l) && l >= minL && l <= maxL;
  const isCustomValid = isValidWidth && isValidLength && tempThickness > 0;

  const getPriceDetails = () => {
    let price = 0;
    let mrp = 0;
    
    if (tempIsCustom) {
      if (isCustomValid) {
        const areaSqFt = (w * l) / 144;
        const rate = ((product.customSizePricing as Record<string, number>) || {})[tempThickness.toString()] || 0;
        price = roundPrice(areaSqFt * rate);
        mrp = price; // Custom items don't have MRP
      }
    } else if (tempVariant) {
      price = roundPrice(Number(tempVariant.salePrice));
      mrp = roundPrice(Number(tempVariant.mrp));
    }

    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    return { price, mrp, discount };
  };

  const { price, mrp, discount } = getPriceDetails();

  const handleConfirm = () => {
    if (tempIsCustom) {
      if (!isCustomValid) return; // Prevent confirm if invalid
      setCustomData({
        width: w,
        length: l,
        thickness: tempThickness,
        calculatedPrice: price,
        isValid: true
      });
      setIsCustomMode(true);
    } else {
      if (tempVariant) onSelect(tempVariant);
      setIsCustomMode(false);
    }
    setQuantity(tempQuantity);
    setIsOpen(false);
  };

  // Trigger Button Display String
  let displayLabel = "";
  if (isCustomMode && customData?.isValid) {
    displayLabel = `Custom | ${customData.thickness} in | ${customData.length}" x ${customData.width}"`;
  } else if (!isCustomMode && currentMattress) {
    displayLabel = `${currentMattress.sizeName.charAt(0) + currentMattress.sizeName.slice(1).toLowerCase()} | ${currentMattress.thickness} in | ${currentMattress.length}" x ${currentMattress.width}"`;
  } else {
    displayLabel = "Select Variant";
  }

  const modalContentJsx = (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 sm:p-6 overflow-y-auto pb-32">
        <div className="bg-sky-100 text-sky-800 rounded-full py-2 px-4 flex justify-between items-center text-sm font-medium mb-6">
          <span>Learn how to measure the right size</span>
          <div className="bg-sky-900 text-white rounded-full p-1"><ChevronDown className="w-4 h-4" /></div>
        </div>

        {/* Category */}
        <div className="space-y-4 mb-8">
          <h3 className="text-center font-semibold text-lg text-slate-800">Category</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {availableCategories.map(cat => (
              <Button
                key={cat}
                variant={tempCategory === cat ? "default" : "outline"}
                className={cn("rounded-full px-6", tempCategory === cat ? "bg-red-50 text-red-600 border-red-500 hover:bg-red-100 hover:text-red-700" : "text-slate-500 font-normal")}
                onClick={() => setTempCategory(cat)}
              >
                {cat === "CUSTOM" ? "Custom" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8" />

        {/* Height / Thickness */}
        {availableThicknesses.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-center font-semibold text-lg text-slate-800">Thickness</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {availableThicknesses.map(t => (
                <Button
                  key={t}
                  variant={tempThickness === t ? "default" : "outline"}
                  className={cn("rounded-full px-6", tempThickness === t ? "bg-red-50 text-red-600 border-red-500 hover:bg-red-100 hover:text-red-700" : "text-slate-500 font-normal")}
                  onClick={() => setTempThickness(t)}
                >
                  {t} in
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full h-px bg-slate-100 mb-8" />

        <div className="space-y-6 mb-8">
          <h3 className="text-center font-semibold text-lg text-slate-800">Size</h3>

          {tempIsCustom ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Length (Inches)</Label>
                  <Input 
                    type="number" 
                    placeholder={`Min ${minL}" - Max ${maxL}"`} 
                    value={tempCustomLength}
                    onChange={(e) => setTempCustomLength(e.target.value)}
                    className={tempCustomLength && !isValidLength ? "border-red-500" : ""}
                  />
                  {tempCustomLength && !isValidLength && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> Between {minL} and {maxL}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Width (Inches)</Label>
                  <Input 
                    type="number" 
                    placeholder={`Min ${minW}" - Max ${maxW}"`} 
                    value={tempCustomWidth}
                    onChange={(e) => setTempCustomWidth(e.target.value)}
                    className={tempCustomWidth && !isValidWidth ? "border-red-500" : ""}
                  />
                  {tempCustomWidth && !isValidWidth && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> Between {minW} and {maxW}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 sm:p-6 rounded-xl flex flex-wrap gap-x-6 gap-y-4 border border-slate-100 justify-center">
              {availableDimensions.map((dim) => {
                const isSelected = tempVariant?.mattressVariant?.length === dim.length && tempVariant?.mattressVariant?.width === dim.width;
                return (
                  <label 
                    key={`${dim.length}x${dim.width}`} 
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => {
                      const match = variants.find(v => 
                        v.mattressVariant?.sizeName === tempCategory && 
                        v.mattressVariant?.thickness === tempThickness &&
                        v.mattressVariant?.length === dim.length &&
                        v.mattressVariant?.width === dim.width
                      );
                      if (match) setTempVariant(match);
                    }}
                  >
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0", isSelected ? "border-red-600" : "border-slate-300")}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-red-600" />}
                    </div>
                    <span className="text-sm font-medium text-slate-800">
                      {dim.length} in x {dim.width} in
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-between z-10">
        <div>
          {mrp > price && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-slate-400 line-through">MRP ₹{formatPrice(mrp)}</span>
              <span className="bg-yellow-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">{discount}% OFF</span>
            </div>
          )}
          <div className="text-xl font-bold text-slate-900">
            ₹{price > 0 ? formatPrice(price) : "0"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-slate-200 rounded-full bg-white overflow-hidden shadow-sm h-10">
            <button
              className="h-full px-3 hover:bg-slate-50 transition-colors"
              onClick={() => setTempQuantity(q => Math.max(1, q - 1))}
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="w-8 text-center text-sm font-medium">
              {tempQuantity}
            </div>
            <button
              className="h-full px-3 hover:bg-slate-50 transition-colors"
              onClick={() => setTempQuantity(q => Math.min(10, q + 1))}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          
          <Button 
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-8 rounded-md font-bold shadow-md"
            onClick={handleConfirm}
            disabled={tempIsCustom && !isCustomValid}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="text-base font-bold text-slate-800">Select Size</label>
      </div>

      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-14 rounded-full border-red-500 text-slate-800 font-bold text-base justify-between px-6 hover:bg-red-50/50">
              <span className="flex-1 text-center">{displayLabel}</span>
              <ChevronDown className="w-5 h-5 text-slate-800 opacity-80" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden h-[85vh] flex flex-col gap-0 border-0 shadow-2xl rounded-2xl">
            <DialogHeader className="p-4 border-b bg-white z-10 shadow-sm shrink-0">
              <DialogTitle className="text-center text-xl font-bold">Select Variant</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {modalContentJsx}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full h-14 rounded-full border-red-500 text-slate-800 font-bold text-base justify-between px-6 hover:bg-red-50/50">
              <span className="flex-1 text-center">{displayLabel}</span>
              <ChevronDown className="w-5 h-5 text-slate-800 opacity-80" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] flex flex-col p-0">
            <DrawerHeader className="p-4 border-b shrink-0 text-center">
              <DrawerTitle className="text-xl font-bold">Select Variant</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden relative">
              {modalContentJsx}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
