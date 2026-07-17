import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    // Delete the subscription matching the endpoint
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint, userId: session.user.id }
    });

    if (existing) {
      await prisma.pushSubscription.delete({
        where: { id: existing.id }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
