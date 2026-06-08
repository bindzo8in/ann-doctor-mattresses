"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProductDetails } from "@/types/product-details";
import { formatPrice } from "@/lib/price";
import { AlertCircle } from "lucide-react";

interface Props {
  product: ProductDetails;
  onCustomVariantUpdate: (data: {
    width: number;
    length: number;
    thickness: number;
    calculatedPrice: number;
    isValid: boolean;
  }) => void;
}

export function CustomSizeSelector({ product, onCustomVariantUpdate }: Props) {
  const customPricing = (product.customSizePricing as Record<string, number>) || {};
  const allowedThicknesses = Object.keys(customPricing).map(Number).sort((a,b)=>a-b);
  
  const [width, setWidth] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [thickness, setThickness] = useState<number>(allowedThicknesses[0] || 6);

  const minW = product.minWidth || 30;
  const maxW = product.maxWidth || 84;
  const minL = product.minLength || 70;
  const maxL = product.maxLength || 84;

  const w = parseFloat(width);
  const l = parseFloat(length);

  const isValidWidth = !isNaN(w) && w >= minW && w <= maxW;
  const isValidLength = !isNaN(l) && l >= minL && l <= maxL;
  const isValid = isValidWidth && isValidLength && thickness > 0;

  let calculatedPrice = 0;
  let areaSqFt = 0;
  let rate = 0;

  if (isValid) {
    areaSqFt = (w * l) / 144;
    rate = customPricing[thickness.toString()] || 0;
    calculatedPrice = Math.round(areaSqFt * rate);
  }

  useEffect(() => {
    onCustomVariantUpdate({
      width: isValidWidth ? w : 0,
      length: isValidLength ? l : 0,
      thickness,
      calculatedPrice,
      isValid
    });
  }, [width, length, thickness, isValidWidth, isValidLength, calculatedPrice, isValid]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Width (Inches)</Label>
          <Input 
            type="number" 
            placeholder={`Min ${minW}" - Max ${maxW}"`} 
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className={width && !isValidWidth ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {width && !isValidWidth && (
            <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> Between {minW} and {maxW}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Label>Length (Inches)</Label>
          <Input 
            type="number" 
            placeholder={`Min ${minL}" - Max ${maxL}"`} 
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={length && !isValidLength ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {length && !isValidLength && (
            <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> Between {minL} and {maxL}
            </span>
          )}
        </div>
      </div>

      {allowedThicknesses.length > 0 && (
        <div className="space-y-3">
          <Label>Thickness</Label>
          <div className="flex flex-wrap gap-2">
            {allowedThicknesses.map(t => (
              <Button
                key={t}
                variant={thickness === t ? "default" : "outline"}
                onClick={() => setThickness(t)}
                className="h-10 px-4"
              >
                {t}"
              </Button>
            ))}
          </div>
        </div>
      )}

      {isValid && rate > 0 ? (
        <div className="bg-slate-50 p-4 rounded-xl border space-y-2 mt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Area ({w}" × {l}"):</span>
            <span>{areaSqFt.toFixed(2)} Sq.Ft</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rate per Sq.Ft ({thickness}" thickness):</span>
            <span>₹{rate}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-medium text-foreground text-lg">
            <span>Total Price:</span>
            <span className="text-destructive font-bold">₹{formatPrice(calculatedPrice)}</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl border border-dashed text-center text-sm text-muted-foreground mt-4">
          Enter valid dimensions to see your custom price.
        </div>
      )}
    </div>
  );
}
