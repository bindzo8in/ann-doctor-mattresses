"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Panel Error:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center bg-muted/20 rounded-lg border border-dashed">
      <div className="rounded-full bg-red-100 p-3 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold">Admin Panel Error</h2>
      <p className="text-sm text-muted-foreground max-w-[500px]">
        An error occurred while loading this administrative view: {error.message}
      </p>
      <Button onClick={() => reset()} variant="default">
        Try again
      </Button>
    </div>
  );
}
