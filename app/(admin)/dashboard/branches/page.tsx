import { BranchesPageClient } from "./branches-client";
import { getBranches } from "@/actions/branches";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const initialData = await getBranches();

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <BranchesPageClient initialData={initialData} />
    </Suspense>
  );
}
