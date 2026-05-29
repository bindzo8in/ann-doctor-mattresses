import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "./lib/prisma";
import authConfig from "./auth.config";
import { routes } from "./lib/routes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",

  adapter: PrismaAdapter(prisma),

  ...authConfig,

  pages: {
    signIn: routes.login,
    error: routes.authError,
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
        token.isEmailVerified = !!user.emailVerified;

        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
        session.user.isEmailVerified = token.isEmailVerified;

        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
      }

      return session;
    },
  },
});
