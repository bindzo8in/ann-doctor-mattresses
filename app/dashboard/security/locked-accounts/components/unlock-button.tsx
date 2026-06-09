"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { unlockAccount } from "@/lib/actions/security";
import { toast } from "sonner";
import { Loader2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";

export function UnlockButton({ userId, userName }: { userId: string; userName: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleUnlock() {
    setIsLoading(true);
    try {
      await unlockAccount(userId);
      toast.success(`${userName}'s account has been unlocked`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to unlock account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUnlock}
      disabled={isLoading}
      className="ml-auto"
    >
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unlock className="w-4 h-4 mr-2" />}
      Unlock
    </Button>
  );
}
