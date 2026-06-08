"use client";

import { useSession } from "next-auth/react";
import { Permission } from "@/lib/permissions";
import { userHasPermission } from "@/lib/rbac";

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { data: session } = useSession();

  if (!session?.user || !userHasPermission(session.user, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
