import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,

    dashboard: ["read"],

    audit: ["create", "read", "update", "delete"],

    branches: ["create", "read", "update", "delete"],

    hero: ["create", "read", "update", "delete"],

    upload: ["create", "read", "update", "delete"],

    orders: ["create", "read", "update", "delete"],

    promotions: ["create", "read", "update", "delete"],

    products: ["create", "read", "update", "delete"],

    categories: ["create", "read", "update", "delete"],

    reviews: ["create", "read", "update", "delete"],

    settings: ["create", "read", "update", "delete"],

    users: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const superAdminRole = ac.newRole({
    ...adminAc.statements,

    dashboard: ["read"],

    audit: ["create", "read", "update", "delete"],
    branches: ["create", "read", "update", "delete"],
    hero: ["create", "read", "update", "delete"],
    upload: ["create", "read", "update", "delete"],

    orders: ["create", "read", "update", "delete"],
    promotions: ["create", "read", "update", "delete"],
    products: ["create", "read", "update", "delete"],
    categories: ["create", "read", "update", "delete"],
    reviews: ["create", "read", "update", "delete"],
    settings: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
});

export const adminRole = ac.newRole({
    dashboard: ["read"],
    orders: ["read", "update"],
    products: ["read"],
    categories: ["read"],
    reviews: ["read"],
    settings: ["read"],
});

export const customerRole = ac.newRole({

})
