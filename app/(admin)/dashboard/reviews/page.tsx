import { ReviewsPageClient } from "./reviews-client";
import { getAdminReviews } from "@/actions/reviews";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const res = await getAdminReviews();
  const initialData = res.success && res.reviews ? res.reviews : [];

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <ReviewsPageClient initialData={initialData} />
    </Suspense>
  );
}
