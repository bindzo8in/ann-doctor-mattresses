import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import prisma from "./lib/prisma";
import { publicRoutes, routes } from "./lib/routes";
import { roleRoutes } from "./lib/route-permissions";
import { matchesExactRoute, matchesRoute } from "./lib/route-matcher";

export default {
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

  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;

      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      const isPublicRoute = publicRoutes.some((route) =>
        matchesRoute(nextUrl.pathname, route),
      );

      if (isApiAuthRoute || isPublicRoute) {
        return true;
      }

      if (!isLoggedIn) {
        const signInUrl = nextUrl.clone();

        signInUrl.pathname = routes.login;

        signInUrl.searchParams.set("callbackUrl", nextUrl.href);

        signInUrl.searchParams.set("error", "AccessDenied");

        return Response.redirect(signInUrl);
      }

      const userRole = auth.user.role;

      const allowedRoutes = roleRoutes[userRole] ?? {
        exact: [],
        nested: [],
      };

      const hasExactAccess = (allowedRoutes.exact ?? []).some((route) =>
        matchesExactRoute(nextUrl.pathname, route),
      );

      const hasNestedAccess = (allowedRoutes.nested ?? []).some((route) =>
        matchesRoute(nextUrl.pathname, route),
      );

      if (!hasExactAccess && !hasNestedAccess) {
        return Response.redirect(new URL(routes.unauthorized, nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
