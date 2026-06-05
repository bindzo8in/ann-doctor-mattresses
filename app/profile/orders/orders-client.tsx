"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, Calendar, CreditCard, ShoppingBag, XCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { cancelOrderAction } from "@/actions/checkout";
import { toast } from "sonner";
import Script from "next/script";

import Image from "next/image";
import { getCustomerOrders } from "@/actions/orders";

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: Date;
  totalAmount: number;
  status: string;
  notes?: string | null;
  payments: Array<{
    razorpayOrderId: string;
    status: string;
  }>;
  items?: Array<{
    product: {
      thumbnailUrl: string;
    };
  }>;
}

interface OrdersClientProps {
  initialOrders: OrderItem[];
  initialNextCursor: string | null;
}

export function OrdersClient({ initialOrders, initialNextCursor }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this pending order?");
    if (!confirmCancel) return;

    setIsProcessing(orderId);
    try {
      await cancelOrderAction(orderId);
      toast.success("Order cancelled successfully");
      
      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const result = await getCustomerOrders(nextCursor, 10);
      setOrders(prev => [...prev, ...result.orders as any]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load more orders");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRetryPayment = (order: OrderItem) => {
    const pendingPayment = order.payments.find(p => p.status === "PENDING") || order.payments[0];
    if (!pendingPayment) {
      toast.error("No pending payment details found");
      return;
    }

    setIsProcessing(order.id);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      name: "Ann Doctor Mattresses",
      description: "Order Payment Retry",
      order_id: pendingPayment.razorpayOrderId,
      handler: async function (response: any) {
        setIsProcessing(order.id);
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
            window.location.href = `${routes.checkoutSuccess}?orderId=${order.id}`;
          } else {
            toast.error("Payment verification failed");
            setIsProcessing(null);
          }
        } catch (err) {
          console.error(err);
          toast.error("Error verifying payment");
          setIsProcessing(null);
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
          setIsProcessing(null);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      toast.error("Payment failed: " + response.error.description);
      setIsProcessing(null);
    });
    rzp.open();
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">No orders yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Once you check out, your mattress and sofa orders will appear here.</p>
        </div>
        <Button onClick={() => router.push(routes.products)}>Browse Products</Button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
          <p className="text-sm text-slate-500">View and track status of all your current and past purchases.</p>
        </div>

        <div className="border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 w-16 text-center">Image</TableHead>
                <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Total Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    {order.items && order.items[0]?.product?.thumbnailUrl ? (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden border bg-slate-100 flex-shrink-0">
                        <Image src={order.items[0].product.thumbnailUrl} alt="Product Thumbnail" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-md border flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{order.orderNumber}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    ₹{formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`${routes.profileOrders}/${order.id}`)}
                      className="text-slate-600 hover:text-slate-950 font-medium"
                    >
                      Details
                    </Button>
                    {order.status === "PENDING_PAYMENT" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryPayment(order)}
                          disabled={isProcessing !== null}
                          className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                        >
                          {isProcessing === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CreditCard className="w-3.5 h-3.5 mr-1" />}
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isProcessing !== null}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {isProcessing === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {nextCursor && (
            <div className="p-4 flex justify-center border-t bg-slate-50/50">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full sm:w-auto"
              >
                {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
