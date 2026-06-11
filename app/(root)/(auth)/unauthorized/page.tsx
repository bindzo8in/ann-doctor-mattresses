// app/unauthorized/page.tsx

import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center p-8 sm:p-12">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <ShieldX className="h-10 w-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Unauthorized Access
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
              You don&apos;t have permission to access this page. If you believe
              this is a mistake, contact your administrator.
            </p>

            {/* Status */}
            <div className="mt-6 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium">
              Error 403
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>

              <BackButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
