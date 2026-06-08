"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar, FileText, CheckCircle2, XCircle, ChevronRight, Truck, ClipboardList, Info, HelpCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { cancelOrderAction } from "@/actions/checkout";
import { toast } from "sonner";
import Script from "next/script";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { formatPrice } from "@/lib/price";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    subTotal: number;
    discountTotal: number;
    shippingTotal: number;
    totalAmount: number;
    shippingAddress: any;
    notes?: string | null;
    courierName?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    items: Array<{
      id: string;
      productName: string;
      quantity: number;
      price: number;
      quantityPurchased: number;
      quantityFree: number;
      unitPrice: number;
      totalPaid: number;
      offerType: string | null;
      saved: number;
      product: {
        thumbnailUrl: string;
      };
    }>;
    payments: Array<{
      razorpayOrderId: string;
      status: string;
    }>;
  };
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [status, setStatus] = useState(order.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  console.log(order)
  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "PENDING_PAYMENT":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Pending Payment</Badge>;
      case "PAID":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Paid</Badge>;
      case "PENDING_ASSIGNMENT":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">Pending Assignment</Badge>;
      case "ASSIGNED":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">Assigned</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Processing</Badge>;
      case "SHIPPED":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100">Shipped</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100">Out for Delivery</Badge>;
      case "DELIVERED":
        return <Badge className="bg-slate-900 text-white hover:bg-slate-900">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "REFUND_INITIATED":
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50">Refund Initiated</Badge>;
      case "REFUNDED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100">Refunded</Badge>;
      default:
        return <Badge variant="outline">{orderStatus}</Badge>;
    }
  };

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this pending order?");
    if (!confirmCancel) return;

    setIsProcessing(true);
    try {
      await cancelOrderAction(order.id);
      toast.success("Order cancelled successfully");
      setStatus("CANCELLED");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    const pendingPayment = order.payments.find(p => p.status === "PENDING") || order.payments[0];
    if (!pendingPayment) {
      toast.error("No pending payment details found");
      return;
    }

    setIsProcessing(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      name: "Ann Doctor Mattresses",
      description: "Order Payment Retry",
      order_id: pendingPayment.razorpayOrderId,
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
            window.location.href = `${routes.checkoutSuccess}?orderNumber=${order.orderNumber}`;
          } else {
            toast.error("Payment verification failed");
            setIsProcessing(false);
          }
        } catch (err) {
          console.error(err);
          toast.error("Error verifying payment");
          setIsProcessing(false);
        }
      },
      prefill: {
        name: "",
        contact: "",
      },
      theme: {
        color: "#0f172a",
      },
      modal: {
        ondismiss: function() {
          toast.warning("Payment closed");
          setIsProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      toast.error("Payment failed: " + response.error.description);
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handleDownloadInvoice = () => {
    try {
      const doc = new jsPDF();

      // Premium styling colors
      const primaryColor = [15, 23, 42]; // #0f172a (Slate 900)
      const greyColor = [100, 116, 139]; // Slate 500
      
      // Header Section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("ANN DOCTOR MATTRESSES", 15, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(230, 230, 230);
      doc.text("Premium Mattresses & Sofas Store", 15, 28);

      // Invoice / Bill Metadata
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("TAX INVOICE", 150, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Invoice No: INV-${order.orderNumber.split("-")[1]}`, 150, 24);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 150, 29);

      // Resets Text Color to standard Slate 900
      doc.setTextColor(30, 41, 59);

      // Business & Customer Details Grid
      let currentY = 50;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Seller Information:", 15, currentY);
      doc.text("Shipping Address / Bill To:", 110, currentY);

      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      // Left Column: Seller details
      doc.text("Ann Doctor Mattresses", 15, currentY);
      doc.text("Geographic Hub: South India", 15, currentY + 5);
      doc.text("Email: support@anndoctor.in", 15, currentY + 10);
      doc.text("GST Included in unit prices", 15, currentY + 15);

      // Right Column: Customer details
      const addr = order.shippingAddress;
      doc.text(addr.fullName || "", 110, currentY);
      doc.text(addr.addressLine1 || "", 110, currentY + 5);
      let nextLineY = currentY + 10;
      if (addr.addressLine2) {
        doc.text(addr.addressLine2, 110, nextLineY);
        nextLineY += 5;
      }
      doc.text(`${addr.city}, ${addr.state} - ${addr.postalCode}`, 110, nextLineY);
      doc.text(`Phone: ${addr.phone}`, 110, nextLineY + 5);

      currentY = nextLineY + 18;

      // Draw Separator line
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY, 195, currentY);

      currentY += 10;

      // Table Header
      doc.setFillColor(248, 250, 252); // #f8fafc
      doc.rect(15, currentY, 180, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Product Details", 18, currentY + 5.5);
      doc.text("Qty", 120, currentY + 5.5);
      doc.text("Unit Price", 145, currentY + 5.5);
      doc.text("Total", 175, currentY + 5.5);

      currentY += 8;

      // Table Items Rows
      doc.setFont("helvetica", "normal");
      order.items.forEach((item) => {
        // Draw row line
        doc.line(15, currentY, 195, currentY);

        if (item.quantityFree > 0) {
          // Purchased Line
          doc.text(item.productName, 18, currentY + 6);
          doc.text(String(item.quantityPurchased), 120, currentY + 6);
          doc.text(`₹ ${formatPrice(item.unitPrice)}`, 145, currentY + 6);
          doc.text(`₹ ${formatPrice(item.totalPaid)}`, 175, currentY + 6);

          currentY += 8;

          // Free Line
          doc.text(`Free ${item.productName}`, 18, currentY + 6);
          doc.text(String(item.quantityFree), 120, currentY + 6);
          doc.text("₹ 0", 145, currentY + 6);
          doc.text("₹ 0", 175, currentY + 6);

          currentY += 10;
        } else {
          // Regular Line
          doc.text(item.productName, 18, currentY + 6);
          doc.text(String(item.quantity), 120, currentY + 6);
          doc.text(`₹ ${formatPrice(item.price)}`, 145, currentY + 6);
          doc.text(`₹ ${formatPrice(item.price * item.quantity)}`, 175, currentY + 6);

          currentY += 10;
        }
      });

      // Bottom border for table
      doc.line(15, currentY, 195, currentY);

      currentY += 8;

      // Total Calculations Summary Align Right
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Subtotal:", 130, currentY);
      doc.text(`₹ ${formatPrice(order.subTotal)}`, 175, currentY);

      if (order.discountTotal > 0) {
        currentY += 5;
        doc.setTextColor(16, 185, 129); // Green BOGO discount
        doc.text("BOGO Discount:", 130, currentY);
        doc.text(`-₹ ${formatPrice(order.discountTotal)}`, 175, currentY);
        doc.setTextColor(30, 41, 59); // reset color
      }

      currentY += 5;
      doc.text("Shipping Charge:", 130, currentY);
      doc.text(order.shippingTotal === 0 ? "Free" : `₹ ${formatPrice(order.shippingTotal)}`, 175, currentY);

      currentY += 8;
      doc.setDrawColor(15, 23, 42);
      doc.line(125, currentY, 195, currentY);

      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Grand Total (INR):", 130, currentY);
      doc.text(`₹ ${formatPrice(order.totalAmount)}`, 175, currentY);

      // Disclaimer Notes
      currentY += 25;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
      doc.text("This is an electronically generated retail invoice. No physical signature is required.", 15, currentY);
      doc.text("For any product inquiries or support, contact support@anndoctor.in.", 15, currentY + 4);

      doc.save(`Invoice-${order.orderNumber}.pdf`);
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const getTimelineSteps = () => {
    if (status === "CANCELLED") {
      const hasPaid = order.payments?.some((p: any) => ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(p.status));
      if (hasPaid) {
        return [
          { label: "Created", status: "PENDING_PAYMENT" },
          { label: "Paid", status: "PAID" },
          { label: "Cancelled", status: "CANCELLED" },
          { label: "Refund Initiated", status: "REFUND_INITIATED" },
          { label: "Refunded", status: "REFUNDED" }
        ];
      }
    }

    // Standard Option B Lifecycle
    return [
      { label: "Created", status: "PENDING_PAYMENT" },
      { label: "Paid", status: "PAID" },
      { label: "Assigned", status: "ASSIGNED" },
      { label: "Processing", status: "PROCESSING" },
      { label: "Out for Delivery", status: "OUT_FOR_DELIVERY" },
      { label: "Delivered", status: "DELIVERED" }
    ];
  };

  const currentStatusIndex = () => {
    const steps = getTimelineSteps();
    
    // Quick status normalization
    let normStatus = status;
    if (status === "PENDING") normStatus = "PENDING_PAYMENT";
    if (status === "PENDING_ASSIGNMENT") normStatus = "PAID";
    if (status === "CONFIRMED") normStatus = "ASSIGNED";
    if (status === "SHIPPED") normStatus = "OUT_FOR_DELIVERY";

    const isRefundTimeline = steps.some(s => s.status === "REFUNDED");
    if (isRefundTimeline) {
      const isFullyRefunded = order.payments?.some((p: any) => p.status === "REFUNDED");
      const hasRefundInitiated = order.payments?.some((p: any) => 
        p.status === "PARTIALLY_REFUNDED" || p.refunds?.some((r: any) => ["INITIATED", "PROCESSING", "COMPLETED"].includes(r.status))
      );
      
      if (isFullyRefunded) normStatus = "REFUNDED";
      else if (hasRefundInitiated) normStatus = "REFUND_INITIATED";
      else normStatus = "CANCELLED";
    } else {
      if (status === "CANCELLED") return -1;
    }

    return steps.findIndex(s => s.status === normStatus);
  };

  const timelineSteps = getTimelineSteps();
  const statusIndex = currentStatusIndex();

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-8">
        
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(routes.profileOrders)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
                Order details: {order.orderNumber}
                {getStatusBadge(status)}
              </h2>
              <p className="text-sm text-slate-500">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Retry Payment */}
            {(status === "PENDING_PAYMENT" || status === "PENDING") && (
              <Button size="sm" onClick={handleRetryPayment} disabled={isProcessing} className="bg-amber-500 text-white hover:bg-amber-600">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Complete Payment
              </Button>
            )}

            {/* Cancel Order */}
            {["PENDING", "PENDING_PAYMENT", "PAID", "PENDING_ASSIGNMENT"].includes(status) && (
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isProcessing} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                Cancel Order
              </Button>
            )}

            {/* Past Cancellation Notice */}
            {["ASSIGNED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(status) && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>To cancel, please contact support.</span>
              </div>
            )}

            {/* Invoice Download */}
            {(status !== "PENDING_PAYMENT" && status !== "CANCELLED") && (
              <Button size="sm" onClick={handleDownloadInvoice} className="gap-2">
                <FileText className="w-4 h-4" /> Download Invoice (PDF)
              </Button>
            )}
          </div>
        </div>

        {/* Timeline Component */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-400" /> Order Tracking Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6 overflow-x-auto">
            {status === "CANCELLED" && statusIndex === -1 ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 text-sm">
                <Info className="w-5 h-5 text-red-600" />
                <span>This order was cancelled. Payment was not successfully processed or order was retracted.</span>
              </div>
            ) : (
              <div className="flex justify-between items-center min-w-[600px] px-4">
                {timelineSteps.map((stepItem, index) => {
                  const isCompleted = index <= statusIndex;
                  const isActive = index === statusIndex;
                  const isCancelledStep = stepItem.status === "CANCELLED";
                  
                  return (
                    <React.Fragment key={stepItem.status}>
                      <div className="flex flex-col items-center space-y-2 relative">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCancelledStep && isCompleted
                              ? "bg-red-50 border-red-500 text-red-600"
                              : isActive
                              ? "bg-slate-900 border-slate-900 text-white shadow-md scale-110"
                              : isCompleted
                              ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          {isCancelledStep && isCompleted ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : isCompleted && !isActive ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="text-center">
                          <span
                            className={`text-xs font-semibold whitespace-nowrap block ${
                              isActive ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {stepItem.label}
                          </span>
                          {(index === 0 || isActive) && isCompleted && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                              {new Date(index === 0 ? order.createdAt : order.updatedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 transition-all ${
                            index < statusIndex 
                              ? timelineSteps[index + 1]?.status === "CANCELLED" 
                                ? "bg-red-400" 
                                : "bg-emerald-400" 
                              : "bg-slate-100"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courier Details Card */}
        {order.courierName && (
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-slate-400" /> Delivery & Shipment Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Courier Partner</div>
                  <div className="font-bold text-slate-800 mt-1">{order.courierName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Tracking ID</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{order.trackingNumber || "N/A"}</div>
                </div>
                {order.trackingUrl && (
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-semibold">Track Live Shipment</div>
                    <div className="mt-1">
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-900 font-bold hover:underline">
                        Launch Courier Portal <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Items Ordered</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {order.items.map((item) => {
                  const isBogo = item.quantityFree > 0;
                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-slate-50 flex-shrink-0">
                        {item.product.thumbnailUrl && (
                          <Image src={item.product.thumbnailUrl} alt={item.productName} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 text-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800">{item.productName}</div>
                            {isBogo && (
                              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium mt-1">
                                {item.offerType === "BUY_1_GET_1" ? "Buy 1 Get 1 Free Applied" : "BOGO Applied"}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 text-right">
                            ₹{formatPrice(Number(item.totalPaid))}
                          </div>
                        </div>
                        
                        {isBogo ? (
                          <div className="grid grid-cols-2 gap-4 mt-2 text-xs border rounded p-2 bg-slate-50 font-medium">
                            <div className="space-y-0.5">
                              <div className="text-[10px] text-muted-foreground uppercase">Quantities</div>
                              <div>Purchased: <span className="font-bold text-slate-800">{item.quantityPurchased}</span></div>
                              <div>Free: <span className="font-bold text-emerald-600">{item.quantityFree}</span></div>
                              <div>Total Delivered: <span className="font-bold text-slate-800">{item.quantity}</span></div>
                            </div>
                            <div className="space-y-0.5 flex flex-col justify-end items-end">
                              <div className="text-[10px] text-muted-foreground uppercase">Pricing</div>
                              <div>Unit Price: <span className="font-bold text-slate-800">₹{formatPrice(Number(item.unitPrice))}</span></div>
                              <div className="text-emerald-600">Saved: <span className="font-bold">₹{formatPrice(Number(item.saved))}</span></div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 mt-1 flex justify-between">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit Price: ₹{formatPrice(Number(item.price))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            {/* Address details */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              </CardContent>
            </Card>

            {/* Calculations details */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{formatPrice(order.subTotal)}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>BOGO Discount</span>
                      <span className="font-semibold">-₹{formatPrice(order.discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-slate-800">
                      {order.shippingTotal === 0 ? "Free" : `₹${formatPrice(order.shippingTotal)}`}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900">Order Notes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 italic">
                  "{order.notes}"
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
