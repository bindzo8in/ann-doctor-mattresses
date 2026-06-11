import { OrdersPageClient } from "./orders-client";
import { getAdminOrders } from "@/actions/orders";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const initialData = await getAdminOrders(null, 10);

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <OrdersPageClient initialData={initialData} />
    </Suspense>
  );
}
