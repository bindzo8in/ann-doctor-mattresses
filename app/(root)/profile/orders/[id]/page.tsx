import { auth } from "@/auth-old";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { getOrderDetails } from "@/actions/orders";
import { OrderDetailClient } from "./order-detail-client";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.login);
  }

  const { id } = await params;
  const order = await getOrderDetails(id);

  return <OrderDetailClient order={order as any} />;
}
