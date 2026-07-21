import { betterAuth } from "better-auth";
import prisma from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "@/env";
import { sendResetPasswordEmail, sendVerificationEmail } from "./email";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin"
import { ac, adminRole, customerRole, superAdminRole } from './permissions'
import { UserRole } from "@/app/generated/prisma/enums";
import { headers as nextHeaders } from "next/headers";

export const authInstance = betterAuth({
    secret: env.AUTH_SECRET,
    baseURL: env.NEXT_PUBLIC_SITE_URL,
    trustedOrigins: [env.NEXT_PUBLIC_SITE_URL],
    advanced: {
        trustedProxyHeaders: true,
    },
    logger: {
        disabled: process.env.NODE_ENV !== 'development',
        disableColors: process.env.NODE_ENV !== 'development',
        level: "debug",
        log: (level, message, ...args) => {
            // Custom logging implementation
            console.log(`[${level}] ${message}`, ...args);
        }
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 60 * 60, // 1 hour,
        sendResetPassword: async ({ url, user }) => {
            sendResetPasswordEmail({
                email: user.email,
                appName: env.NEXT_PUBLIC_APP_NAME,
                resetUrl: url,
                supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL
            })
        },
        revokeSessionsOnPasswordReset: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        expiresIn: 24 * 60 * 60, // 24 hours
        sendVerificationEmail: async ({ user, url }) => {
            sendVerificationEmail({
                appName: env.NEXT_PUBLIC_APP_NAME,
                name: user.name,
                supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL,
                verificationUrl: url,
                email: user.email,
            })
        },
        autoSignInAfterVerification: true,
    },
    plugins: [
        admin({
            ac,
            defaultRole: UserRole.CUSTOMER,
            roles: {
                [UserRole.SUPER_ADMIN]: superAdminRole,
                [UserRole.BRANCH_ADMIN]: adminRole,
                [UserRole.CUSTOMER]: customerRole
            }
        }),
        nextCookies()
    ]
});

export const auth = Object.assign(
    async (input?: { headers?: Headers } | Headers) => {
        let requestHeaders: Headers | undefined;

        if (input instanceof Headers) {
            requestHeaders = input;
        } else if (input?.headers) {
            requestHeaders = input.headers;
        } else {
            try {
                requestHeaders = await nextHeaders();
            } catch {
                return null;
            }
        }

        if (!requestHeaders) {
            return null;
        }

        return authInstance.api.getSession({ headers: requestHeaders });
    },
    { api: authInstance.api }
) as typeof authInstance & {
    api: typeof authInstance.api;
    (input?: { headers?: Headers } | Headers): Promise<any>;
};