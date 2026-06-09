// proxy.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { authRateLimit, globalRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    if (authRateLimit) {
      const { success } = await authRateLimit.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests - Auth", { status: 429 });
      }
    }
  } else if (req.nextUrl.pathname.startsWith("/api/")) {
    if (globalRateLimit) {
      const { success } = await globalRateLimit.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests - Global", { status: 429 });
      }
    }
  }

  // custom logic if needed
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
