import { env } from "@/env"
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, adminRole, customerRole, superAdminRole } from "@/lib/permissions";
import { UserRole } from "@/app/generated/prisma/enums";

const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return env.NEXT_PUBLIC_SITE_URL;
};

const authClient = createAuthClient({
    /** The base URL of the server */
    baseURL: getBaseUrl(),
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

export const { signIn, signUp, signOut, sendVerificationEmail, updateUser, changePassword, requestPasswordReset, resetPassword, admin } = authClient

export const useSession = () => {
    const session = authClient.useSession()
    const status = session.isPending ? "loading" : session.data?.session ? "authenticated" : "unauthenticated"

    return {
        ...session,
        status,
    }
}