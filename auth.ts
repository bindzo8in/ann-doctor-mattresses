import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "./lib/prisma";
import authConfig from "./auth.config";
import { auditLogger } from "./lib/audit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",

  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: String(credentials.email).toLowerCase(),
          },
        });

        if (!user) {
          return null;
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked.");
        }

        const validPassword = await bcrypt.compare(
          String(credentials.password),
          user.password,
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  pages: authConfig.pages,
  session: authConfig.session,

  callbacks: {
    ...authConfig.callbacks,
  },

  events: {
    async signIn({ user }) {
      if (user?.id) {
        await auditLogger.log({
          action: "USER_LOGIN",
          entityType: "Auth",
          entityId: user.id,
          description: `User ${user.email} logged in`,
          actorUserId: user.id,
          actorRole: (user as any).role,
        });
      }
    },
  },
});
