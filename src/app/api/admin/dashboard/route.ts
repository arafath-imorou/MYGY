import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    const inventory = await prisma.inventoryItem.findMany();

    // Financial Metrics
    let totalRevenueMonth = 0;
    let totalCollected = 0;
    let totalReceivables = 0;

    orders.forEach((o) => {
      totalRevenueMonth += o.totalAmount;
      totalCollected += o.totalPaid;
      totalReceivables += o.balanceDue;
    });

    // Production Stage Counters
    const productionStats = {
      coupe: 0,
      couture: 0,
      broderie: 0,
      retouche: 0,
      qualite: 0,
      pret: 0,
    };

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.currentStage === "COUPE") productionStats.coupe++;
        else if (item.currentStage === "COUTURE") productionStats.couture++;
        else if (item.currentStage === "BRODERIE") productionStats.broderie++;
        else if (item.currentStage === "RETOUCHE") productionStats.retouche++;
        else if (item.currentStage === "CONTROLE_QUALITE") productionStats.qualite++;
        else if (item.currentStage === "PRET") productionStats.pret++;
      });
    });

    // Stock Alerts
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
      productionStats,
      lowStockItems,
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
