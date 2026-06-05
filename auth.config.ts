import type { NextAuthConfig } from "next-auth";
import { roleRoutes } from "./lib/route-permissions";
import { matchesExactRoute, matchesRoute } from "./lib/route-matcher";
import { publicRoutes, routes } from "./lib/routes";

export default {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: routes.login,
    error: routes.authError,
  },
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      console.log(auth);
      const isLoggedIn = !!auth?.user;

      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      const isPublicRoute = publicRoutes.some((route) =>
        matchesRoute(nextUrl.pathname, route),
      );

      if (isApiAuthRoute || isPublicRoute) {
        return true;
      }
      console.log("isApiAuthRoute",isApiAuthRoute,)
      console.log("isPublicRoute",isPublicRoute)
      console.log("isLoggedIn",isLoggedIn)
      

      if (!isLoggedIn) {
        const signInUrl = nextUrl.clone();

        signInUrl.pathname = routes.login;

        signInUrl.searchParams.set("callbackUrl", nextUrl.href);

        signInUrl.searchParams.set("error", "AccessDenied");

        return Response.redirect(signInUrl);
      }

      const userRole = auth?.user?.role;

      if (!userRole) {
        return Response.redirect(new URL(routes.unauthorized, nextUrl));
      }

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
      console.log({
        pathname: nextUrl.pathname,
        role: auth?.user?.role,
      });

      console.log("allowedRoutes", allowedRoutes);

      console.log(
        "hasExactAccess",
        (allowedRoutes.exact ?? []).some((route) =>
          matchesExactRoute(nextUrl.pathname, route),
        ),
      );

      console.log(
        "hasNestedAccess",
        (allowedRoutes.nested ?? []).some((route) =>
          matchesRoute(nextUrl.pathname, route),
        ),
      );
      if (!hasExactAccess && !hasNestedAccess) {
        return Response.redirect(new URL(routes.unauthorized, nextUrl));
      }

      return true;
    },

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
} satisfies NextAuthConfig;
