import { PromotionsPageClient } from "./promotions-client";
import { getAdminPromotions } from "@/actions/promotions";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const initialData = await getAdminPromotions(null, 10);

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <PromotionsPageClient initialData={initialData} />
    </Suspense>
  );
}
