import { WishlistPageClient } from "./wishlist-client";
import { getUserWishlist } from "@/actions/wishlist";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { items, isAuthenticated } = await getUserWishlist();

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex flex-col items-center justify-center font-montserrat"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
      <WishlistPageClient initialItems={items} initialIsAuthenticated={isAuthenticated} />
    </Suspense>
  );
}
