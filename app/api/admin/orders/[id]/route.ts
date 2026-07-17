import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendDeliveryStatusEmail } from "@/lib/email";
import { auditLogger } from "@/lib/audit";
import { hasBetterAuthPermission } from "@/lib/auth-permissions";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await hasBetterAuthPermission("orders.update"))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, courierName, trackingNumber, trackingUrl, cancelReason } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(courierName && { courierName }),
        ...(trackingNumber && { trackingNumber }),
        ...(trackingUrl !== undefined && { trackingUrl }),
        ...(cancelReason !== undefined && { cancelReason }),
      }
    });

    await auditLogger.log({
      action: "ORDER_STATUS_UPDATED",
      entityType: "Order",
      entityId: order.id,
      description: `Order ${order.orderNumber} updated via admin panel`,
      newValues: { status, courierName, trackingNumber, cancelReason },
      actorUserId: session!.user.id,
      actorRole: session!.user.role ?? undefined,
    });

    if (status === "DELIVERED") {
      // Fire-and-forget — admin panel response must not block on email delivery
      sendDeliveryStatusEmail(id).catch((error) => {
        console.error("[AdminOrders] Failed to send delivery status email", {
          orderId: id,
          orderNumber: order.orderNumber,
          error,
        });
      });
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
