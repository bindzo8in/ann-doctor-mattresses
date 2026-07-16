// lib/rbac.ts

import { Permission } from "./permissions.old";
import { UserRole } from "@/app/generated/prisma/enums";
import { rolePermissions } from "./role-permissions";

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === UserRole.SUPER_ADMIN) return true; // Super Admin has all permissions implicitly or explicitly
  
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes(permission);
}

/**
 * Check if a session user has a specific permission
 */
export function userHasPermission(user: any, permission: Permission): boolean {
  if (!user || !user.role) return false;
  
  // If we already injected permissions into the user session
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.role === UserRole.SUPER_ADMIN || user.permissions.includes(permission);
  }
  
  return hasPermission(user.role as UserRole, permission);
}
