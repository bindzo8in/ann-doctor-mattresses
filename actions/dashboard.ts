"use server";

import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";

export type PeriodFilter = "today" | "this_week" | "last_month" | "this_year" | "all_time";

function getDateRange(period: PeriodFilter): { start: Date | undefined; end: Date | undefined } {
  const now = new Date();
  
  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }
  
  if (period === "this_week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }
  
  if (period === "this_year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: now };
  }
  
  return { start: undefined, end: undefined }; // all_time
}

export async function getDashboardStats(period: PeriodFilter = "all_time") {
  const session = await auth();
  if (!userHasPermission(session?.user, "dashboard.read")) {
    throw new Error("Unauthorized");
  }

  const { start, end } = getDateRange(period);
  
  const dateFilter = start && end ? {
    createdAt: {
      gte: start,
      lte: end
    }
  } : {};

  try {
    // Total Revenue (only paid orders)
    const revenueAggregation = await prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.PAID, 
            OrderStatus.PENDING_ASSIGNMENT, 
            OrderStatus.ASSIGNED, 
            OrderStatus.PROCESSING, 
            OrderStatus.SHIPPED, 
            OrderStatus.OUT_FOR_DELIVERY, 
            OrderStatus.DELIVERED
          ]
        },
        ...dateFilter
      },
      _sum: {
        totalAmount: true
      }
    });
    
    const totalRevenue = Number(revenueAggregation._sum.totalAmount || 0);
    
    // Daily Orders (Total orders count for the period)
    const totalOrdersCount = await prisma.order.count({
      where: {
        ...dateFilter
      }
    });

    // Orders requiring attention (Pending assignment or Processing)
    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PROCESSING]
        },
        ...dateFilter
      }
    });

    // Delivered Orders
    const deliveredOrdersCount = await prisma.order.count({
      where: {
        status: OrderStatus.DELIVERED,
        ...dateFilter
      }
    });

    return {
      totalRevenue,
      totalOrdersCount,
      pendingOrdersCount,
      deliveredOrdersCount
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getRecentOrders(limit: number = 5) {
  const session = await auth();
  if (!userHasPermission(session?.user, "dashboard.read")) {
    throw new Error("Unauthorized");
  }

  try {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    return orders.map(order => ({
      ...order,
      subTotal: Number(order.subTotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      totalAmount: Number(order.totalAmount),
    }));
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to fetch recent orders");
  }
}

export async function getChartData(period: PeriodFilter = "all_time") {
  const session = await auth();
  if (!userHasPermission(session?.user, "dashboard.read")) {
    throw new Error("Unauthorized");
  }

  const { start, end } = getDateRange(period);
  
  const dateFilter = start && end ? {
    createdAt: {
      gte: start,
      lte: end
    }
  } : {};

  try {
    let rawData: any[];

    if (start && end) {
      rawData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*)::int as orders,
          SUM(CASE WHEN status::text IN ('PAID', 'PENDING_ASSIGNMENT', 'ASSIGNED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED') THEN "totalAmount" ELSE 0 END) as revenue
        FROM "Order"
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `;
    } else {
      rawData = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*)::int as orders,
          SUM(CASE WHEN status::text IN ('PAID', 'PENDING_ASSIGNMENT', 'ASSIGNED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED') THEN "totalAmount" ELSE 0 END) as revenue
        FROM "Order"
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `;
    }

    return rawData.map(row => ({
      name: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(row.date)),
      revenue: Number(row.revenue || 0),
      orders: Number(row.orders)
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}
