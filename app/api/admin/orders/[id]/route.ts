import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendDeliveryStatusEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, courierName, trackingNumber, trackingUrl } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(courierName && { courierName }),
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl !== undefined && { trackingUrl }),
      }
    });

    if (status === "DELIVERED") {
      await sendDeliveryStatusEmail(id);
    }

    if (status && order.customerId) {
      try {
        const { NotificationService } = await import("@/lib/notification-service");
        await NotificationService.notifyUser(
          order.customerId,
          "Order Status Updated",
          `Your order #${order.orderNumber} is now ${status.replace(/_/g, " ")}.`,
          "ORDER",
          "/profile/orders"
        );
      } catch (err) {
        console.error("Notification Error:", err);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin Order PATCH Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
