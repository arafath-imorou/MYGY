import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbOrders: any[] = [];
    try {
      dbOrders = await prisma.order.findMany({
        include: {
          customer: true,
          items: true,
          payments: true,
        },
      });
    } catch (e) {
      console.warn("Prisma dashboard orders query fallback:", e);
    }

    const cloudData = await getCloudData();
    const cloudOrders = cloudData.orders || [];

    const orders = [...cloudOrders, ...dbOrders.filter((p) => !cloudOrders.some((c: any) => c.id === p.id))];

    // Financial Metrics
    let totalRevenueMonth = 0;
    let totalCollected = 0;
    let totalReceivables = 0;

    orders.forEach((o: any) => {
      totalRevenueMonth += Number(o.totalAmount || 0);
      totalCollected += Number(o.totalPaid || 0);
      totalReceivables += Number(o.balanceDue || 0);
    });

    let inventory: any[] = [];
    try {
      inventory = await prisma.inventoryItem.findMany();
    } catch (e) {}

    const lowStockItems = inventory.filter((i) => i.availableStock <= i.minThreshold);
    const recentOrders = orders.slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalRevenueMonth,
        totalCollected,
        totalReceivables,
        totalOrders: orders.length,
        lowStockCount: lowStockItems.length,
      },
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
