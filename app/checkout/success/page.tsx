"use client";

import React, { useEffect, useState, Suspense } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!orderNumber) {
      router.push("/");
    }
  }, [orderNumber, router]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mb-8 text-lg max-w-md">
        Thank you for your purchase. Your order ID is <span className="font-semibold text-foreground">{orderNumber}</span>. We've sent a confirmation email with your order details.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/profile/orders">View Orders</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
