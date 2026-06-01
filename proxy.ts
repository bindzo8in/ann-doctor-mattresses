// proxy.ts

import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // custom logic if needed
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)"],
};
