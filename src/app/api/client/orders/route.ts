import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientTimelineSteps } from "@/lib/workflows";
import { getCloudData } from "@/lib/cloudDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Identifiant client requis" }, { status: 400 });
    }

    let prismaCust: any = null;
    let prismaOrders: any[] = [];
    try {
      prismaCust = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          loyaltyAccount: true,
          measurements: { orderBy: { takenAt: "desc" }, take: 1 },
        },
      });
      if (prismaCust) {
        prismaOrders = await prisma.order.findMany({
          where: { customerId: prismaCust.id },
          include: {
            items: true,
            payments: true,
            fittings: true,
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma client orders query fallback:", dbErr);
    }

    const cloudData = await getCloudData();
    const cloudCusts = cloudData.customers || [];
    const cloudOrders = cloudData.orders || [];

    const customerObj = prismaCust || cloudCusts.find((c: any) => c.id === customerId || c.phone === customerId);

    if (!customerObj) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    const userCloudOrders = cloudOrders.filter((o: any) => o.customerId === customerObj.id || o.customerId === customerId);
    const mergedOrdersList = [...prismaOrders, ...userCloudOrders.filter((co: any) => !prismaOrders.some((po: any) => po.id === co.id))];

    const formattedOrders = mergedOrdersList.map((order) => {
      return {
        ...order,
        timeline: getClientTimelineSteps(order.clientStepStatus || "COMMANDE_CONFIRMEE"),
      };
    });

    return NextResponse.json({
      customer: customerObj,
      orders: formattedOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
