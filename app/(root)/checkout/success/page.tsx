"use client";

import React, { useEffect, useState, Suspense } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

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
      <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-muted-foreground mb-8 text-lg max-w-md">
        Thank you for your purchase. Your order ID is <span className="font-semibold text-foreground">{orderNumber}</span>. We've sent confirmation details to your provided contact.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild variant="outline">
          <Link href={`${routes.trackOrder}?orderNumber=${encodeURIComponent(orderNumber)}`} scroll>
            Track Order
          </Link>
        </Button>
        {session?.user ? (
          <Button asChild variant="outline">
            <Link href="/profile/orders" scroll>View My Orders</Link>
          </Button>
        ) : null}
        <Button asChild className="bg-[#E53935] hover:bg-red-700">
          <Link href="/products" scroll>Continue Shopping</Link>
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
