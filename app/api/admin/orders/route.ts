// Force cache invalidation
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();

    const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  console.log("TOKEN:", token);
  console.log(
    "COOKIES:",
    cookieStore.getAll().map(c => c.name)
  );
  const session = await auth();
  console.log("session:", session)
  if (session?.user?.role !== "SUPER_ADMIN") {
    console.log("unauthorised access ", session?.user?.role)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        payments: true,
        items: true,
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
