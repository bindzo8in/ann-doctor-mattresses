// lib/permissions.ts

export const permissions = [
  // orders
  "orders.read",
  "orders.update",
  "orders.delete",
  "orders.refund",

  // branches
  "branches.read",
  "branches.create",
  "branches.update",
  "branches.delete",

  // products
  "products.read",
  "products.create",
  "products.update",
  "products.delete",

  // promotions
  "promotions.read",
  "promotions.create",
  "promotions.update",
  "promotions.delete",

  // reviews
  "reviews.read",
  "reviews.update",
  "reviews.delete",

  // users
  "users.read",
  "users.create",
  "users.update",
  "users.delete",

  // settings & hero
  "settings.read",
  "settings.update",

  // dashboard
  "dashboard.read",

  // audit
  "audit.read",
] as const;

export type Permission = (typeof permissions)[number];