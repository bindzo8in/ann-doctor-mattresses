"use server";

import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";

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
  const { start, end } = getDateRange(period);
  
  const dateFilter = start && end ? {
    createdAt: {
      gte: start,
      lte: end
    }
  } : {};

  try {
    // Total Revenue (only paid orders)
    const paidOrders = await prisma.order.findMany({
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
      select: {
        totalAmount: true
      }
    });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    
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
    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to fetch recent orders");
  }
}

export async function getChartData(period: PeriodFilter = "all_time") {
  const { start, end } = getDateRange(period);
  
  const dateFilter = start && end ? {
    createdAt: {
      gte: start,
      lte: end
    }
  } : {};

  try {
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date (format: Jan 12)
    const grouped: Record<string, { revenue: number; orders: number }> = {};

    orders.forEach(order => {
      const dateKey = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(order.createdAt));
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { revenue: 0, orders: 0 };
      }
      
      grouped[dateKey].orders += 1;
      
      const isPaidStatus = ([
        OrderStatus.PAID, 
        OrderStatus.PENDING_ASSIGNMENT, 
        OrderStatus.ASSIGNED, 
        OrderStatus.PROCESSING, 
        OrderStatus.SHIPPED, 
        OrderStatus.OUT_FOR_DELIVERY, 
        OrderStatus.DELIVERED
      ] as OrderStatus[]).includes(order.status as OrderStatus);

      if (isPaidStatus) {
        grouped[dateKey].revenue += Number(order.totalAmount);
      }
    });

    return Object.entries(grouped).map(([date, data]) => ({
      name: date,
      revenue: data.revenue,
      orders: data.orders
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}
