"use client";

import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { data: session } = useSession();

  const canAccess = useMemo(() => {
    if (!session?.user) return false;

    if (session.user.role === "SUPER_ADMIN") return true;

    return false;
  }, [session?.user]);

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
