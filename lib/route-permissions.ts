// lib/route-permissions.ts

import { UserRole } from "@/app/generated/prisma/enums";
import { routes } from "./routes";

type RouteConfig = {
  exact: string[];
  nested: string[];
};

export const roleRoutes: Record<UserRole, RouteConfig> = {
  [UserRole.SUPER_ADMIN]: {
    exact: [routes.dashboard],
    nested: [routes.product_create],
  },

  [UserRole.CUSTOMER]: {
    exact: [],
    nested: [],
  },
};
