// lib/role-permissions.ts

import { UserRole } from "@/app/generated/prisma/enums";
import { Permission } from "./permissions";

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    "orders.read",
    "orders.update",
    "orders.delete",
    "orders.refund",

    "branches.read",
    "branches.create",
    "branches.update",
    "branches.delete",

    "products.read",
    "products.create",
    "products.update",
    "products.delete",

    "promotions.read",
    "promotions.create",
    "promotions.update",
    "promotions.delete",

    "reviews.read",
    "reviews.update",
    "reviews.delete",

    "users.read",
    "users.create",
    "users.update",
    "users.delete",

    "settings.read",
    "settings.update",

    "dashboard.read",

    "audit.read",
  ],

  [UserRole.BRANCH_ADMIN]: [
    "orders.read",
    "orders.update",
    "products.read",
    "reviews.read",
    "settings.read",
    "dashboard.read",
  ],

  [UserRole.CUSTOMER]: [],
};