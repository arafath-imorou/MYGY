import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientTimelineSteps } from "@/lib/workflows";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Identifiant client requis" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyaltyAccount: true,
        measurements: { orderBy: { takenAt: "desc" }, take: 1 },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // STRICT CUSTOMER ISOLATION: Fetch ONLY this customer's orders!
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            fashionModel: true,
          },
        },
        payments: true,
        fittings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      return {
        ...order,
        timeline: getClientTimelineSteps(order.clientStepStatus),
      };
    });

    return NextResponse.json({
      customer,
      orders: formattedOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
