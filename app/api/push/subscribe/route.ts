import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json({ error: "Invalid subscription: missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      // The session exists but the user was deleted from the database
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert subscription (update if endpoint exists, otherwise create)
    // We check if the same endpoint exists. If so, update user. If not, create.
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: session.user.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        }
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal server error", details: error?.message || String(error) }, { status: 500 });
  }
}
