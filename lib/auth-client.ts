import { env } from "@/env"
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, adminRole, customerRole, superAdminRole } from "@/lib/permissions";
import { UserRole } from "@/app/generated/prisma/enums";

export const { signIn, signUp, useSession, sendVerificationEmail, updateUser, changePassword, requestPasswordReset, resetPassword } = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: env.NEXT_PUBLIC_SITE_URL,
    plugins: [
        adminClient({
            ac,
            roles: {
                [UserRole.SUPER_ADMIN]: superAdminRole,
                [UserRole.BRANCH_ADMIN]: adminRole,
                [UserRole.CUSTOMER]: customerRole
            }
        })
    ]
})