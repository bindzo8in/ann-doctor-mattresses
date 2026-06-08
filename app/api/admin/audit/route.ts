import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!userHasPermission(session?.user, "audit.read")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");
    const entityType = searchParams.get("entityType");
    const action = searchParams.get("action");
    const actorUserId = searchParams.get("actorUserId");

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (actorUserId) where.actorUserId = actorUserId;

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined = undefined;
    if (logs.length > limit) {
      const nextItem = logs.pop();
      nextCursor = nextItem!.id;
    }

    // Get aggregated metrics
    const totalEvents = await prisma.auditLog.count({ where });

    return NextResponse.json({ logs, nextCursor, totalEvents });
  } catch (error) {
    console.error("Admin Audit GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
