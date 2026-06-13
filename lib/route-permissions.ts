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
      routes.dashboard_hero,
      routes.product_create,
      routes.dashboard_products,
      routes.dashboard_orders,
      routes.dashboard_promotions,
      routes.dashboard_settings,
      routes.checkout,
      routes.checkoutSuccess,
      routes.profile,
      routes.wishlist,
      routes.dashboard_reviews,
      routes.dashboard_audit,
      routes.dashboard_security,
      routes.dashboard_users,
      routes.dashboard_branches,
      routes.api_upload,
      routes.api_admin,
      "/api/notifications",
      "/api/categories"
    ],
  },

  [UserRole.BRANCH_ADMIN]: {
    exact: [routes.dashboard],
    nested: [
      routes.dashboard_orders,
      routes.dashboard_reviews,
      routes.checkout,
      routes.checkoutSuccess,
      routes.profile,
      routes.wishlist,
      routes.api_upload,
      routes.api_admin,
      "/api/notifications",
      "/api/categories"
    ],
  },

  [UserRole.CUSTOMER]: {
    exact: [],
    nested: [
      routes.profile,
      routes.wishlist,
      routes.checkoutSuccess,
      routes.help,
    ],
  },
};
