import React, { Suspense } from "react";
import { Metadata } from "next";
import { TrackOrderClient } from "./track-order-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Your Order | Ann Doctor Mattresses",
  description: "Track the real-time status and delivery updates of your order.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
