import { AuditLogsPageClient } from "./audit-client";
import { getAuditLogs } from "@/actions/audit";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const initialData = await getAuditLogs({ limit: 50 });

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>}>
      <AuditLogsPageClient initialData={initialData} />
    </Suspense>
  );
}
