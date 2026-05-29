// lib/route-permissions.ts

import { UserRole } from "@/app/generated/prisma/enums";

type RouteConfig = {
  exact: string[];
  nested: string[];
};

export const roleRoutes: Record<UserRole, RouteConfig> = {
  [UserRole.SUPER_ADMIN]: {
    exact: ["/dashboard"],
    nested: ["/dashboard/users", "/dashboard/settings"],
  },

  [UserRole.CUSTOMER]: {
    exact: [],
    nested: []
  },

};
