import { UserRole } from "@/app/generated/prisma/enums";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,


} as const;

export const ac = createAccessControl(statement);

export const superAdminRole = ac.newRole({
    ...adminAc.statements,
})

export const adminRole = ac.newRole({

})

export const customerRole = ac.newRole({

})