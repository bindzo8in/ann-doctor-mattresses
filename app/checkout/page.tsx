"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { AddressSelector } from "@/components/checkout/address-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { routes } from "@/lib/routes";
import { getCheckoutTotals, cancelOrderAction } from "@/actions/checkout";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { useCheckoutStore } from "@/hooks/use-checkout";
import { CheckoutSource } from "@/app/generated/prisma/enums";
import { formatPrice, toRazorpayAmount } from "@/lib/price";

export default function CheckoutPage() {
  const { cartItems, isLoading: isCartLoading } = useCart();
  const router = useRouter();

  // Get active checkout source
  const source = useCheckoutStore(state => state.source);
  const buyNowItem = useCheckoutStore(state => state.buyNowItem);

  const checkoutItems = source === CheckoutSource.BUY_NOW && buyNowItem
    ? [buyNowItem]
    : cartItems;

  // Multi-step state: 1 = Address, 2 = Review, 3 = Payment
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [notes, setNotes] = useState("");
  
  // Totals calculation state
  const [totals, setTotals] = useState({
    subTotal: 0,
    discountTotal: 0,
    shippingTotal: 0,
    totalAmount: 0,
    appliedPromotion: null as string | null,
    items: [] as any[],
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment failed retry state
  const [createdOrder, setCreatedOrder] = useState<{
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amount: number;
  } | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Load totals when selected address or step changes
  useEffect(() => {
    if (step === 2 && selectedAddress) {
      const fetchTotals = async () => {
        setIsCalculating(true);
        try {
          const res = await getCheckoutTotals({
            source: source === CheckoutSource.BUY_NOW ? "BUY_NOW" : "CART",
            pincode: selectedAddress.postalCode,
            buyNowItem: source === CheckoutSource.BUY_NOW && buyNowItem ? {
              productId: buyNowItem.productId,
              variantId: buyNowItem.variantId,
              quantity: buyNowItem.quantity
            } : undefined
          });
          setTotals(res);
        } catch (err) {
          console.error("Calculation error:", err);
          toast.error("Failed to calculate order totals");
        } finally {
          setIsCalculating(false);
        }
      };
      fetchTotals();
    }
  }, [step, selectedAddress, source, buyNowItem]);

  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  const hasItems = source === CheckoutSource.BUY_NOW ? !!buyNowItem : (cartItems && cartItems.length > 0);

  if (!hasItems) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-slate-500">Add some comfortable mattresses or premium sofas to get started.</p>
          <Button className="w-full" onClick={() => router.push(routes.products)}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const handleCheckoutInit = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsProcessing(true);
    setPaymentFailed(false);
    try {
      // Step 3 transition
      setStep(3);

      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          addressId: selectedAddressId, 
          notes,
          source: source === CheckoutSource.BUY_NOW ? "BUY_NOW" : "CART",
          buyNowItem: source === CheckoutSource.BUY_NOW && buyNowItem ? {
            productId: buyNowItem.productId,
            variantId: buyNowItem.variantId,
            quantity: buyNowItem.quantity
          } : undefined
        }),
      });

      if (!res.ok) {
        console.log("Failed to initialize checkout", res);
        throw new Error("Failed to initialize checkout");
      }

      const data = await res.json();
      setCreatedOrder(data);
      triggerRazorpayPayment(data);
    } catch (error) {
      console.error(error);
      toast.error("Checkout initialization failed. Please try again.");
      setStep(2);
      setIsProcessing(false);
    }
  };

  const triggerRazorpayPayment = (orderData: typeof createdOrder) => {
    if (!orderData) return;

    const options = {
      key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: toRazorpayAmount(orderData.amount),
      currency: "INR",
      name: "Ann Doctor Mattresses",
      description: "Order Payment",
      order_id: orderData.razorpayOrderId,
      handler: async function (response: any) {
        setIsProcessing(true);
        try {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful!");
            window.location.href = `${routes.checkoutSuccess}?orderId=${orderData.orderId}`;
          } else {
            toast.error("Payment verification failed");
            setPaymentFailed(true);
            setIsProcessing(false);
          }
        } catch (err) {
          console.error(err);
          toast.error("Error verifying payment");
          setPaymentFailed(true);
          setIsProcessing(false);
        }
      },
      prefill: {
        name: selectedAddress?.fullName || "",
        contact: selectedAddress?.phone || "",
      },
      theme: {
        color: "#0f172a",
      },
      modal: {
        ondismiss: function() {
          toast.warning("Payment modal closed. Order is saved, you can try again.");
          setPaymentFailed(true);
          setIsProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay payment.failed:", response.error);
      toast.error("Payment failed: " + response.error.description);
      setPaymentFailed(true);
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handleCancelOrder = async () => {
    if (!createdOrder) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this pending order?");
    if (!confirmCancel) return;

    setIsProcessing(true);
    try {
      await cancelOrderAction(createdOrder.orderId);
      toast.info("Order cancelled successfully.");
      router.push(routes.products);
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl space-y-8">
          
          {/* Breadcrumb Steps Header */}
          <div className="flex justify-between items-center max-w-lg mx-auto mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>1</span>
              <span className={`text-sm font-medium ${step === 1 ? "text-slate-900" : "text-slate-400"}`}>Shipping</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-100" />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>2</span>
              <span className={`text-sm font-medium ${step === 2 ? "text-slate-900" : "text-slate-400"}`}>Confirm</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-100" />
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 3 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>3</span>
              <span className={`text-sm font-medium ${step === 3 ? "text-slate-900" : "text-slate-400"}`}>Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: Address Selection */}
            {step === 1 && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Select Delivery Address</h2>
                  <p className="text-sm text-slate-500">Choose a saved address or create a new one to proceed.</p>
                  <AddressSelector 
                    selectedAddressId={selectedAddressId} 
                    onSelect={setSelectedAddressId} 
                    onSelectAddress={setSelectedAddress} 
                  />
                </div>
                
                {selectedAddressId && (
                  <div className="flex justify-end">
                    <Button size="lg" className="px-8" onClick={() => setStep(2)}>
                      Continue to Review
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Order Notes & Review */}
            {step === 2 && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Review & Notes</h2>
                      <p className="text-sm text-slate-500">Confirm details and add any delivery instructions.</p>
                    </div>
                  </div>

                  {/* Address Summary Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="font-semibold text-slate-900">Shipping to:</div>
                    <div className="text-slate-700 text-sm">
                      <p className="font-medium">{selectedAddress?.fullName}</p>
                      <p>{selectedAddress?.addressLine1}</p>
                      {selectedAddress?.addressLine2 && <p>{selectedAddress?.addressLine2}</p>}
                      <p>{selectedAddress?.city}, {selectedAddress?.state} - <span className="font-semibold">{selectedAddress?.postalCode}</span></p>
                      <p className="mt-1">Phone: {selectedAddress?.phone}</p>
                    </div>
                  </div>

                  {/* Order Notes Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Delivery Instructions / Order Notes (Optional)</label>
                    <Textarea 
                      placeholder="E.g. Please leave the mattress at the front desk, deliver after 2 PM, or landmark near the park." 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-24 resize-none"
                    />
                  </div>

                  {/* Secure checkout assurances */}
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Your transaction is encrypted. Standard retail prices include GST. Razorpay securely processes payment.</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setStep(1)}>Go Back</Button>
                  <Button size="lg" className="px-8" onClick={handleCheckoutInit} disabled={isCalculating}>
                    Confirm & Proceed to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Loading / Retry */}
            {step === 3 && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center py-16 space-y-8">
                  {isProcessing && !paymentFailed ? (
                    <div className="space-y-4">
                      <Loader2 className="animate-spin w-12 h-12 text-slate-900 mx-auto" />
                      <h3 className="text-xl font-bold text-slate-900">Initializing Payment Gateway...</h3>
                      <p className="text-slate-500 max-w-sm mx-auto">Creating secure payment order. Please complete the Razorpay checkout overlay once it loads.</p>
                    </div>
                  ) : paymentFailed ? (
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-100">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Payment Pending / Failed</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                          Your order <strong>{createdOrder?.orderNumber}</strong> has been created, but payment was not completed. You can retry the payment or cancel this order to go back.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto pt-4">
                        <Button size="lg" className="flex-1" onClick={() => triggerRazorpayPayment(createdOrder)}>
                          Retry Payment (₹{formatPrice(createdOrder?.amount ?? 0)})
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleCancelOrder}>
                          Cancel Order
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                      <h3 className="text-xl font-bold text-slate-900">Order Placed Successfully</h3>
                      <p className="text-slate-500">Payment completed. Redirecting to confirmation...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sticky Order Summary column */}
            <div>
              <Card className="sticky top-20 bg-white border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Cart items list - read-only */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {checkoutItems.map((item) => {
                      const calc = totals.items.find(
                        (ci) => ci.productId === item.productId && ci.variantId === item.variantId
                      );
                      const isBogo = calc && calc.quantityFree > 0;

                      return (
                        <div key={(item as any).id || item.productId} className="flex gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border bg-slate-50">
                            {item.product.thumbnailUrl && (
                              <Image src={item.product.thumbnailUrl} alt={item.product.name} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 text-sm space-y-1">
                            <div className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</div>
                            
                            {isBogo ? (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-600">
                                  <span>{calc.quantityPurchased} Purchased @ ₹{formatPrice(Number(calc.unitPrice))}</span>
                                  <span className="font-semibold text-slate-800">₹{formatPrice(Number(calc.totalPaid))}</span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-600 font-medium bg-emerald-50/50 px-1.5 py-0.5 rounded">
                                  <span>{calc.quantityFree} Free @ ₹0 (Offer Applied)</span>
                                  <span>Saved ₹{formatPrice(Number(calc.saved))}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Total Delivered Quantity: {calc.totalDelivered} units
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between text-slate-500">
                                <span>Qty: {item.quantity}</span>
                                <span className="font-semibold text-slate-700">
                                  ₹{formatPrice(Number(item.variant?.salePrice || 0))}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calculating Totals overlay skeleton */}
                  {isCalculating ? (
                    <div className="border-t pt-4 space-y-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                      <div className="h-6 bg-slate-200 rounded animate-pulse w-full mt-2" />
                    </div>
                  ) : (
                    <>
                      <div className="border-t pt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-medium text-slate-800">₹{formatPrice(step === 2 ? totals.subTotal : checkoutItems.reduce((t, i) => t + Number(i.variant?.salePrice || 0) * i.quantity, 0))}</span>
                        </div>
                        {step === 2 && totals.discountTotal > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount (BOGO)</span>
                            <span>-₹{formatPrice(totals.discountTotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="font-medium text-slate-800">
                            {step === 2 
                              ? totals.shippingTotal === 0 ? "Free" : `₹${totals.shippingTotal}` 
                              : "Calculated next"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4 flex justify-between font-bold text-lg text-slate-900">
                        <span>Total</span>
                        <span>₹{formatPrice(step === 2 ? totals.totalAmount : checkoutItems.reduce((t, i) => t + Number(i.variant?.salePrice || 0) * i.quantity, 0))}</span>
                      </div>
                    </>
                  )}

                  {step === 1 && selectedAddressId && (
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </Button>
                  )}

                  {step === 2 && totals.totalAmount > 100000 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs shadow-sm">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="block mb-0.5">High Value Transaction</strong>
                        Your total exceeds ₹1,00,000. Please note that standard UPI transfers typically have a limit of ₹1 Lakh per day. We recommend using Net Banking or Credit/Debit Cards for this payment.
                      </span>
                    </div>
                  )}

                  {step === 2 && (
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleCheckoutInit} 
                      disabled={isCalculating || isProcessing}
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Pay ₹{formatPrice(totals.totalAmount)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
