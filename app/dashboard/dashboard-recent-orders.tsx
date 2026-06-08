"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/price";
import { Badge } from "@/components/ui/badge";

export function DashboardRecentOrders({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">No recent orders found.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const initials = order.customer?.name 
          ? order.customer.name.substring(0, 2).toUpperCase() 
          : "CU";

        return (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{order.customer?.name || "Guest User"}</p>
              <p className="text-xs text-muted-foreground">
                {order.customer?.email}
              </p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <span className="text-sm font-bold">₹{formatPrice(order.totalAmount)}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(order.createdAt)}
                </span>
                <Badge variant="outline" className={`text-[10px] h-4 px-1 py-0 ${getStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
