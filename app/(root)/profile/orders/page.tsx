import { auth } from "@/auth-old";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { getCustomerOrders } from "@/actions/orders";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.login);
  }

  const { orders, nextCursor } = await getCustomerOrders(null, 10);

  return <OrdersClient initialOrders={orders as any} initialNextCursor={nextCursor} />;
}
