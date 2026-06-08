import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@/app/generated/prisma/enums";
import { Permission } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      isEmailVerified: boolean;
      permissions: Permission[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: Date | null;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    isActive: boolean;
    email: string;
    isEmailVerified: boolean;
    permissions: Permission[];
  }
}