import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapOrderStatusToClientStep } from "@/lib/workflows";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbOrders: any[] = [];
    try {
      dbOrders = await prisma.order.findMany({
        include: {
          customer: true,
          items: {
            include: {
              productionJobs: true,
            },
          },
          payments: true,
          fittings: true,
          qualityChecks: true,
          stockReservations: {
            include: {
              inventoryItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma orders query fallback:", e);
    }

    const cloudData = await getCloudData();
    const cloudOrders = cloudData.orders || [];

    const merged = [...cloudOrders, ...dbOrders.filter((p) => !cloudOrders.some((c: any) => c.id === p.id))];

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerId || !body.itemName || !body.totalAmount) {
      return NextResponse.json({ error: "Client, Nom de la tenue et Montant sont requis." }, { status: 400 });
    }

    let orderCount = 0;
    try {
      orderCount = await prisma.order.count();
    } catch (dbErr) {
      orderCount = Math.floor(Math.random() * 8999) + 1000;
    }
    const reference = `ORD-2026-${String(orderCount + 1).padStart(4, "0")}`;

    const totalAmount = Number(body.totalAmount);
    const depositRequired = Number(body.depositRequired || 0);
    const balanceDue = totalAmount;

    const orderDate = body.orderDate ? new Date(body.orderDate) : new Date();
    const promisedDate = body.promisedDate ? new Date(body.promisedDate) : new Date(Date.now() + 14 * 86400 * 1000);
    let orderResult: any = null;

    try {
      orderResult = await prisma.order.create({
        data: {
          reference,
          customerId: body.customerId,
          orderDate,
          promisedDate,
          priority: body.priority || "VIP",
          status: depositRequired > 0 ? "ACOMPTE_ATTENDU" : "PRODUCTION",
          clientStepStatus: "COMMANDE_CONFIRMEE",
          totalAmount,
          depositRequired,
          totalPaid: 0,
          balanceDue,
          items: {
            create: [
              {
                itemName: body.itemName,
                fabricDetails: body.fabricDetails || "Tissu fourni par la cliente",
                customNotes: body.customNotes || null,
                price: totalAmount,
                estimatedCost: totalAmount * 0.35,
                currentStage: "COUPE",
                productionJobs: {
                  create: [
                    { stage: "COUPE", status: "A_FAIRE", assignedRole: "COUPEUR", qrCode: `QR-${reference}-COUPE` },
                    { stage: "COUTURE", status: "A_FAIRE", assignedRole: "COUTURIER", qrCode: `QR-${reference}-COUTURE` },
                    { stage: "BRODERIE", status: "A_FAIRE", assignedRole: "BRODEUR", qrCode: `QR-${reference}-BRODERIE` },
                    { stage: "FINITION", status: "A_FAIRE", assignedRole: "RESPONSABLE_FINITIONS", qrCode: `QR-${reference}-FINITION` },
                    { stage: "CONTROLE_QUALITE", status: "A_FAIRE", assignedRole: "CONTROLEUR_QUALITE", qrCode: `QR-${reference}-QC` },
                  ],
                },
              },
            ],
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // Create Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: "CREATE_ORDER",
            entity: "Order",
            entityId: orderResult.id,
            details: JSON.stringify({ reference: orderResult.reference, totalAmount: orderResult.totalAmount, fabric: body.fabricDetails }),
          },
        });
      } catch (auditErr) {
        console.warn("Audit log skipped:", auditErr);
      }
    } catch (createErr) {
      console.warn("Prisma Order Create fallback:", createErr);
      orderResult = {
        id: `ord_${Date.now()}`,
        reference,
        customerId: body.customerId,
        orderDate: orderDate.toISOString(),
        promisedDate: promisedDate.toISOString(),
        priority: body.priority || "VIP",
        status: depositRequired > 0 ? "ACOMPTE_ATTENDU" : "PRODUCTION",
        totalAmount,
        depositRequired,
        totalPaid: 0,
        balanceDue,
        items: [
          {
            id: `item_${Date.now()}`,
            itemName: body.itemName,
            fabricDetails: body.fabricDetails || "Tissu fourni par la cliente",
            customNotes: body.customNotes || null,
            price: totalAmount,
            currentStage: "COUPE",
          },
        ],
      };
    }

    // Save to Cloud Database so ALL devices see this order instantly
    await updateCloudData((store) => {
      const existing = store.orders || [];
      const updatedOrders = [orderResult, ...existing.filter((o: any) => o.id !== orderResult.id)];
      return { ...store, orders: updatedOrders };
    });

    return NextResponse.json(orderResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { orderId, newStatus, currentStage, newPayment } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    let updatedData: any = {};

    if (newStatus) {
      updatedData.status = newStatus;
      updatedData.clientStepStatus = mapOrderStatusToClientStep(newStatus);
    }

    if (newPayment && newPayment.amount > 0) {
      const receiptCount = await prisma.payment.count();
      const receiptNumber = `REC-2026-${String(receiptCount + 1).padStart(4, "0")}`;

      await prisma.payment.create({
        data: {
          receiptNumber,
          orderId: order.id,
          customerId: order.customerId,
          amount: newPayment.amount,
          paymentMode: newPayment.paymentMode || "ESPECES",
          transactionRef: newPayment.transactionRef,
          receivedBy: newPayment.receivedBy || "Administration GY",
          notes: newPayment.notes,
        },
      });

      const totalPaid = order.totalPaid + newPayment.amount;
      const balanceDue = Math.max(0, order.totalAmount - totalPaid);

      updatedData.totalPaid = totalPaid;
      updatedData.balanceDue = balanceDue;

      if (balanceDue === 0 && order.status === "SOLDE_A_PAYER") {
        updatedData.status = "PRET";
        updatedData.clientStepStatus = "PRETE";
      }
    }

    if (currentStage && order.items.length > 0) {
      await prisma.orderItem.updateMany({
        where: { orderId: order.id },
        data: { currentStage },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updatedData,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
