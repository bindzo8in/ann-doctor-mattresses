"use client";

import React, { useState } from "react";
import { ShoppingBag, X, Loader2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { useCheckoutStore } from "@/hooks/use-checkout";
import { CheckoutSource } from "@/app/generated/prisma/enums";
import { formatPrice } from "@/lib/price";

export function CartDrawer() {
  const { 
    cartItems, 
    isLoading, 
    cartCount, 
    updateQuantity, 
    removeFromCart, 
    subTotal, 
    discountTotal, 
    shippingTotal,
    totalAmount,
    pincode,
  } = useCart();
  const [open, setOpen] = useState(false);
  const setCheckoutSession = useCheckoutStore(state => state.setCheckoutSession);
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Shopping Cart" className="relative p-2 text-primary hover:text-primary/80 transition">
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={() => setOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product.thumbnailUrl && (
                      <Image 
                        src={item.product.thumbnailUrl} 
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                      {item.quantityFree > 0 && (
                        <div className="text-xs space-y-0.5 mt-1">
                          <div className="flex justify-between text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded font-medium">
                            <span>Offer: {item.offerName || "BOGO Applied"}</span>
                            <span>Saved ₹{formatPrice(Number(item.saved))}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center border rounded p-1 mt-1 bg-slate-50 font-medium">
                            <div>
                              <div className="text-[9px] text-muted-foreground uppercase">Buy</div>
                              <div className="font-bold text-slate-800 text-xs">{item.quantityPurchased}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-muted-foreground uppercase">Free</div>
                              <div className="font-bold text-emerald-600 text-xs">{item.quantityFree}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-muted-foreground uppercase">Delivered</div>
                              <div className="font-bold text-slate-800 text-xs">{item.totalDelivered}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-slate-900">
                          ₹{formatPrice(Number(item.unitPrice))}
                        </div>
                        {item.quantityFree > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            Charged for {item.quantityPurchased} only
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-input rounded-md">
                          <button 
                            disabled={item.quantity <= 1}
                            className="p-1 px-2 hover:bg-muted disabled:opacity-50 text-xs transition font-semibold"
                            onClick={() => updateQuantity({ cartItemId: item.id, quantity: item.quantity - 1 })}
                          >
                            -
                          </button>
                          <span className="text-xs px-1 font-semibold">{item.quantity}</span>
                          <button 
                            className="p-1 px-2 hover:bg-muted text-xs transition font-semibold"
                            onClick={() => updateQuantity({ cartItemId: item.id, quantity: item.quantity + 1 })}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-muted rounded transition"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems && cartItems.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Subtotal (Value)</span>
              <span>₹{formatPrice(subTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>BOGO Savings</span>
                <span>-₹{formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                Delivery
                {pincode && (
                  <span className="text-xs bg-muted rounded px-1 py-0.5 font-mono">
                    {pincode}
                  </span>
                )}
              </span>
              <span className={shippingTotal === 0 ? "text-emerald-600 font-medium" : ""}>
                {shippingTotal === 0 ? "Free" : `₹${formatPrice(shippingTotal)}`}
              </span>
            </div>
            {!pincode && (
              <p className="text-xs text-muted-foreground/80 -mt-1">
                Add your address to see delivery charge.
              </p>
            )}
            <div className="flex justify-between font-bold text-base text-slate-900 border-t pt-2">
              <span>Total Payable</span>
              <span>₹{formatPrice(totalAmount)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                setCheckoutSession(CheckoutSource.CART);
                setOpen(false);
                router.push(routes.checkout);
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
