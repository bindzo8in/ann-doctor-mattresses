// Force cache invalidation
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasBetterAuthPermission } from "@/lib/auth-permissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasBetterAuthPermission("orders.read"))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "100");

    let whereClause = {};
    if (session!.user.role === "BRANCH_ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: session!.user.id } });
      if (!dbUser || !dbUser.branchId) {
        return NextResponse.json({ orders: [], nextCursor: undefined }); // No branch, no orders
      }
      whereClause = { branchId: dbUser.branchId };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        payments: {
          include: { refunds: true }
        },
        items: true,
      }
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (orders.length > limit) {
      const nextItem = orders.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({ orders, nextCursor });
  } catch (error) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
