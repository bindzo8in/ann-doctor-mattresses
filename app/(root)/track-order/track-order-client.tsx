"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShoppingBag,
  Building2,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { trackPublicOrder } from "@/actions/orders";
import { formatPrice } from "@/lib/price";

const ORDER_STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Order submitted" },
  { key: "PAID", label: "Payment Confirmed", desc: "Payment verified" },
  { key: "PROCESSING", label: "Processing", desc: "Preparing for dispatch" },
  { key: "SHIPPED", label: "Out for Delivery", desc: "In transit" },
  { key: "DELIVERED", label: "Delivered", desc: "Order completed" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "PENDING":
    case "PENDING_PAYMENT":
      return 0;
    case "PAID":
    case "PENDING_ASSIGNMENT":
      return 1;
    case "ASSIGNED":
    case "CONFIRMED":
    case "PROCESSING":
      return 2;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
      return -1;
    default:
      return 1;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Payment</Badge>;
    case "PAID":
    case "CONFIRMED":
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmed</Badge>;
    case "PENDING_ASSIGNMENT":
    case "ASSIGNED":
    case "PROCESSING":
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Processing</Badge>;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">Out for Delivery</Badge>;
    case "DELIVERED":
      return <Badge className="bg-green-700 hover:bg-green-800 text-white">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter your Order ID / Number");
      return;
    }
    if (!phoneOrEmail.trim()) {
      toast.error("Please enter your phone number or email for verification");
      return;
    }

    setIsLoading(true);
    try {
      const data = await trackPublicOrder({
        orderNumber: orderNumber.trim(),
        phoneOrEmail: phoneOrEmail.trim(),
      });
      setOrderData(data);
      toast.success("Order details retrieved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to find order. Please verify your details.");
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy tracking number
  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setHasCopied(true);
    toast.success("Tracking number copied!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const currentStep = orderData ? getStepIndex(orderData.status) : 0;
  const isCancelled = orderData?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-8 font-montserrat">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 text-[#E53935] rounded-2xl mb-1">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Track Your Order
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base">
            Check the live progress, delivery timeline, and courier tracking details of your mattress or sofa order.
          </p>
        </div>

        {/* Lookup Card */}
        <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber" className="text-xs font-semibold uppercase text-slate-700">
                    Order Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="orderNumber"
                    placeholder="e.g. ORD-1786963492278-52F5D8"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    className="h-12 font-mono text-sm uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneOrEmail" className="text-xs font-semibold uppercase text-slate-700">
                    Mobile Number or Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneOrEmail"
                    placeholder="e.g. 9876543210 or name@example.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    required
                    className="h-12 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="lg" className="w-full sm:w-auto px-8 h-12 bg-[#E53935] hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  {isLoading ? "Looking up..." : "Track Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Details Result */}
        {orderData && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Header info */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order ID</div>
                    <h2 className="text-2xl font-bold text-slate-900 font-mono">{orderData.orderNumber}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Placed on {new Date(orderData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>{getStatusBadge(orderData.status)}</div>
                </div>

                {/* Progress Steps Timeline */}
                {!isCancelled ? (
                  <div className="py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep >= idx;
                        const isCurrent = currentStep === idx;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400"
                              } ${isCurrent ? "ring-4 ring-slate-900/10 scale-105" : ""}`}
                            >
                              {isDone ? <Check className="w-5 h-5" /> : idx + 1}
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    <span>This order has been cancelled. If you made a payment, refunds are automatically processed to the original payment source.</span>
                  </div>
                )}

                {/* Courier / Dispatch Card if shipped */}
                {(orderData.courierName || orderData.trackingNumber) && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
                      <Truck className="w-4 h-4 text-indigo-600" />
                      <span>Courier & Tracking Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-900">
                      <div>
                        <span className="text-indigo-500 block font-medium">Courier Partner:</span>
                        <span className="font-semibold text-sm">{orderData.courierName || "Standard Express"}</span>
                      </div>
                      <div>
                        <span className="text-indigo-500 block font-medium">Tracking / AWB Number:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-sm text-slate-900">{orderData.trackingNumber}</span>
                          {orderData.trackingNumber && (
                            <button
                              onClick={() => copyTracking(orderData.trackingNumber)}
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-100"
                              title="Copy tracking number"
                            >
                              {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {orderData.trackingUrl && (
                      <div className="pt-2">
                        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                          <a href={orderData.trackingUrl} target="_blank" rel="noopener noreferrer">
                            Track on Courier Website <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Assigned Branch info */}
                {orderData.branch && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>
                        Fulfilling Location: <strong>{orderData.branch.name}</strong> ({orderData.branch.city})
                      </span>
                    </div>
                    {orderData.branch.phone && (
                      <a href={`tel:${orderData.branch.phone}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> {orderData.branch.phone}
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Items Card */}
              <Card className="md:col-span-2 bg-white border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-500" /> Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 divide-y space-y-4">
                  {orderData.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border shrink-0">
                        {item.product?.thumbnailUrl ? (
                          <Image src={item.product.thumbnailUrl} alt={item.productName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm space-y-1">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        {item.variantData?.isCustom && item.variantData?.customData && (
                          <div className="text-xs text-slate-500">
                            Custom: {item.variantData.customData.width}" × {item.variantData.customData.length}" × {item.variantData.customData.thickness}"
                          </div>
                        )}
                        {item.variantData?.mattressVariant && (
                          <div className="text-xs text-slate-500">
                            {item.variantData.mattressVariant.sizeName} ({item.variantData.mattressVariant.width}"×{item.variantData.mattressVariant.length}") • {item.variantData.mattressVariant.thickness}"
                          </div>
                        )}
                        {item.variantData?.sofaVariant && (
                          <div className="text-xs text-slate-500">
                            {item.variantData.sofaVariant.seatingCapacity} Seater
                          </div>
                        )}
                        {item.color && (
                          <div className="text-xs text-slate-500">Colour: {item.color}</div>
                        )}
                        <div className="flex justify-between items-center pt-1 text-xs">
                          <span className="text-slate-500">Qty: {item.quantity}</span>
                          <span className="font-semibold text-slate-900">₹{formatPrice(Number(item.totalPaid || item.price))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Address & Totals */}
              <div className="space-y-6">
                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" /> Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-sm text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">{orderData.shippingAddress?.fullName}</p>
                    <p>{orderData.shippingAddress?.addressLine1}</p>
                    {orderData.shippingAddress?.addressLine2 && <p>{orderData.shippingAddress?.addressLine2}</p>}
                    <p>
                      {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} -{" "}
                      <span className="font-semibold">{orderData.shippingAddress?.postalCode}</span>
                    </p>
                    <p className="pt-2 text-xs text-slate-500">Phone: {orderData.shippingAddress?.phone}</p>
                    {orderData.shippingAddress?.email && <p className="text-xs text-slate-500">Email: {orderData.shippingAddress?.email}</p>}
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base font-bold text-slate-900">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">₹{formatPrice(orderData.subTotal)}</span>
                    </div>
                    {orderData.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Offer Discount</span>
                        <span>-₹{formatPrice(orderData.discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-medium text-slate-900">
                        {orderData.shippingTotal === 0 ? "Free" : `₹${formatPrice(orderData.shippingTotal)}`}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base text-slate-900">
                      <span>Total Paid</span>
                      <span>₹{formatPrice(orderData.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
