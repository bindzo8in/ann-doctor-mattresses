"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Search, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLogsPageClientProps {
  initialData: {
    logs: any[];
    nextCursor?: string;
    totalEvents: number;
  };
}

export function AuditLogsPageClient({ initialData }: AuditLogsPageClientProps) {
  const [actionFilter, setActionFilter] = useState("");

  const [entityFilter, setEntityFilter] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Pagination state
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const resetPagination = () => {
    setCursorHistory([null]);
    setCurrentIndex(0);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", actionFilter, entityFilter, actorUserId, fromDate, toDate, cursorHistory[currentIndex]],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      
      const cursor = cursorHistory[currentIndex];
      if (cursor) params.set("cursor", cursor);
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entityType", entityFilter);
      if (actorUserId) params.set("actorUserId", actorUserId);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
    initialData: currentIndex === 0 && !actionFilter && !entityFilter && !actorUserId && !fromDate && !toDate ? initialData : undefined,
  });


  const handleClearFilters = () => {
    setActionFilter("");
    setEntityFilter("");
    setActorUserId("");
    setFromDate("");
    setToDate("");
    resetPagination();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-2">Track and monitor all system events and user actions.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700">Filter Logs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Action Type</label>
            <Input 
              placeholder="e.g. ORDER_UPDATED" 
              value={actionFilter} 
              onChange={(e) => { setActionFilter(e.target.value); resetPagination(); }} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Entity Type</label>
            <Input 
              placeholder="e.g. Order" 
              value={entityFilter} 
              onChange={(e) => { setEntityFilter(e.target.value); resetPagination(); }} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">User ID</label>
            <Input 
              placeholder="Search by User ID" 
              value={actorUserId} 
              onChange={(e) => { setActorUserId(e.target.value); resetPagination(); }} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">From Date</label>
            <Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => { setFromDate(e.target.value); resetPagination(); }} 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">To Date</label>
            <Input 
              type="date" 
              value={toDate} 
              onChange={(e) => { setToDate(e.target.value); resetPagination(); }} 
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-slate-500">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-slate-500 mt-2">Loading logs...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-red-500">
                    Failed to load audit logs.
                  </TableCell>
                </TableRow>
              ) : data?.logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    No audit logs found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.logs?.map((log: any) => (
                  <TableRow 
                    key={log.id} 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-medium text-slate-600">
                      {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900">{log.entityType}</span>
                      {log.entityId && <span className="text-xs text-slate-500 ml-1">#{log.entityId.slice(-6)}</span>}
                    </TableCell>
                    <TableCell>
                      {log.actorRole ? (
                        <span className="text-sm text-slate-700">{log.actorRole}</span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">System</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 truncate max-w-[300px]">
                      {log.description || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0 || isLoading}
        >
          Previous
        </Button>
        <div className="text-sm font-medium px-2">Page {currentIndex + 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
             const nextCursor = data?.nextCursor;
             if (nextCursor) {
                const nextHistory = [...cursorHistory.slice(0, currentIndex + 1), nextCursor];
                setCursorHistory(nextHistory);
                setCurrentIndex(currentIndex + 1);
             }
          }}
          disabled={!data?.nextCursor || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-6 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Timestamp</p>
                    <p className="text-sm font-medium mt-1">
                      {format(new Date(selectedLog.createdAt), "dd MMM yyyy, HH:mm:ss")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Action</p>
                    <p className="text-sm font-medium mt-1">{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Entity Type</p>
                    <p className="text-sm font-medium mt-1">{selectedLog.entityType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Entity ID</p>
                    <p className="text-sm font-medium mt-1 font-mono">{selectedLog.entityId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Actor Role</p>
                    <p className="text-sm font-medium mt-1">{selectedLog.actorRole || "System"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Actor User ID</p>
                    <p className="text-sm font-medium mt-1 font-mono">{selectedLog.actorUserId || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Description</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedLog.description || "No description provided."}
                  </p>
                </div>

                {selectedLog.metadata && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Metadata</p>
                    <pre className="text-xs bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.oldValues && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Old Values</p>
                    <pre className="text-xs bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.newValues && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">New Values</p>
                    <pre className="text-xs bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
