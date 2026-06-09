import { Metadata } from "next";
import { getAuditLogs } from "@/lib/actions/security";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Audit Logs | Security Dashboard",
};

export default async function AuditLogsPage(props: {
  searchParams: Promise<{ action?: string; userId?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const take = 50;
  const skip = (page - 1) * take;

  const { logs, total } = await getAuditLogs({
    action: searchParams.action,
    userId: searchParams.userId,
    skip,
    take,
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Security Audit Logs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            A log of all security-related activities across the platform. (Total: {total})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>IP / User Agent</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                      No security logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const meta = log.metadata as any;
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {meta?.email || "Unknown"}
                          </div>
                          {log.entityId && (
                            <div className="text-xs text-muted-foreground">
                              ID: {log.entityId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{log.ipAddress || "N/A"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={log.userAgent || ""}>
                            {log.userAgent || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm truncate" title={log.description || ""}>
                            {log.description}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
