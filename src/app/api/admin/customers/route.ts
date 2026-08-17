import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbCustomers: any[] = [];
    try {
      dbCustomers = await prisma.customer.findMany({
        include: {
          measurements: { orderBy: { takenAt: "desc" } },
          orders: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" } },
          appointments: true,
          loyaltyAccount: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma customer query fallback:", e);
    }

    const cloudData = await getCloudData();
    const cloudCusts = cloudData.customers || [];

    const merged = [...cloudCusts, ...dbCustomers.filter((p) => !cloudCusts.some((c: any) => c.id === p.id))];

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.syncBatch) {
      const { customers, orders } = body;
      const updated = await updateCloudData((store) => {
        const existingCusts = store.customers || [];
        const existingOrders = store.orders || [];
        const newCusts = Array.isArray(customers) ? customers : [];
        const newOrders = Array.isArray(orders) ? orders : [];
        const mergedCusts = [...existingCusts, ...newCusts.filter((nc: any) => !existingCusts.some((ec: any) => ec.id === nc.id))];
        const mergedOrders = [...existingOrders, ...newOrders.filter((no: any) => !existingOrders.some((eo: any) => eo.id === no.id))];
        return { ...store, customers: mergedCusts, orders: mergedOrders };
      });
      return NextResponse.json({ success: true, customers: updated.customers, orders: updated.orders });
    }

    if (!body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json({ error: "Prénom, Nom et Téléphone sont obligatoires." }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const cloudData = await getCloudData();
    const existingCusts = cloudData.customers || [];
    let count = existingCusts.length;

    try {
      const dbCount = await prisma.customer.count();
      if (dbCount > count) count = dbCount;
    } catch (dbErr) {}

    const orderNum = String(count + 1).padStart(3, "0");
    const code = `CLI/GYMC/${currentYear}/${orderNum}`;
    const firstName = String(body.firstName || "").toUpperCase();
    const lastName = String(body.lastName || "").toUpperCase();
    const city = String(body.city || "Cotonou").toUpperCase();
    const profession = body.profession ? String(body.profession).toUpperCase() : null;

    let customerResult: any = null;

    try {
      customerResult = await prisma.customer.create({
        data: {
          code,
          firstName,
          lastName,
          phone: body.phone,
          email: body.email || null,
          city,
          country: body.country || "Bénin",
          category: body.category || "Standard",
          profession,
          acquisitionSource: body.acquisitionSource || "Passage",
          notes: body.notes || null,
          loyaltyAccount: {
            create: {
              tier: body.category === "VVIP" || body.category === "VIP" ? "GY VIP Diamond" : "GY Classic",
              points: body.category === "VVIP" ? 1000 : body.category === "VIP" ? 500 : 0,
            },
          },
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "CREATE_CUSTOMER",
            entity: "Customer",
            entityId: customerResult.id,
            details: JSON.stringify({ code: customerResult.code, name: `${customerResult.firstName} ${customerResult.lastName}` }),
          },
        });
      } catch (auditErr) {
        console.warn("Audit log skipped:", auditErr);
      }
    } catch (createErr: any) {
      console.warn("Prisma Customer Create fallback:", createErr);
      customerResult = {
        id: `cust_${Date.now()}`,
        code,
        firstName,
        lastName,
        phone: body.phone,
        email: body.email || null,
        city,
        category: body.category || "Standard",
        createdAt: new Date().toISOString(),
        orders: [],
      };
    }

    // Save to Cloud Database so ALL devices see this customer instantly
    await updateCloudData((store) => {
      const existing = store.customers || [];
      const updatedCusts = [customerResult, ...existing.filter((c: any) => c.id !== customerResult.id)];
      return { ...store, customers: updatedCusts };
    });

    return NextResponse.json(customerResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, firstName, lastName, phone, email, city, category, profession, notes, measurements } = body;

    if (!id) {
      return NextResponse.json({ error: "ID client manquant." }, { status: 400 });
    }

    let updatedCustomer: any = null;
    try {
      updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          firstName,
          lastName,
          phone,
          email: email || null,
          city: city || "Cotonou",
          category: category || "VIP",
          profession: profession || null,
          notes: notes || null,
        },
      });
    } catch (e) {
      updatedCustomer = { id, firstName, lastName, phone, email, city, category, profession, notes };
    }

    await updateCloudData((store) => {
      const existing = store.customers || [];
      const updatedCusts = existing.map((c: any) => (c.id === id ? { ...c, ...updatedCustomer } : c));
      return { ...store, customers: updatedCusts };
    });

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "ID client manquant." }, { status: 400 });
    }

    try {
      await prisma.customer.delete({
        where: { id },
      });
    } catch (delErr) {
      console.warn("Prisma Customer Delete fallback:", delErr);
    }

    await updateCloudData((store) => {
      const existing = store.customers || [];
      const updatedCusts = existing.filter((c: any) => c.id !== id);
      return { ...store, customers: updatedCusts };
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
