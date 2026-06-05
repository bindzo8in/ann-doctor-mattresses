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
    nested: [
      routes.product_create,
      routes.dashboard_products,
      routes.dashboard_orders,
      routes.dashboard_promotions,
      routes.checkout,
    ],
  },

  [UserRole.CUSTOMER]: {
    exact: [],
    nested: [
      routes.profile,
      routes.checkoutSuccess,
    ],
  },
};
