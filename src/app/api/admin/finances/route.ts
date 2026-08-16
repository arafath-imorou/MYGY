import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbPayments: any[] = [];
    try {
      dbPayments = await prisma.payment.findMany({
        include: {
          customer: true,
          order: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma payments query fallback:", e);
    }

    const cloudData = await getCloudData();
    const cloudRecettes = cloudData.recettes || [];
    const cloudDepenses = cloudData.depenses || [];

    // Merge Receipts (CloudStore + SQLite DB)
    const mergedRecettes = [
      ...cloudRecettes,
      ...dbPayments.filter((p) => !cloudRecettes.some((c: any) => c.id === p.id)),
    ];

    // Fetch expenses logged in audit log
    let auditExpenses: any[] = [];
    try {
      auditExpenses = await prisma.auditLog.findMany({
        where: { action: "CREATE_EXPENSE" },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {}

    const dbExpensesList = auditExpenses.map((a) => {
      let details: any = {};
      try {
        details = JSON.parse(a.details || "{}");
      } catch (e) {}
      return {
        id: a.id,
        reference: details.reference || "DEP-2026-0001",
        category: details.category || "Achat Tissus",
        description: details.description || "Achat Matières Premières Atelier",
        amount: Number(details.amount || 0),
        supplier: details.supplier || "Fournisseur",
        paymentMode: details.paymentMode || "ESPECES",
        createdAt: a.createdAt,
      };
    });

    const mergedDepenses = [
      ...cloudDepenses,
      ...dbExpensesList.filter((d) => !cloudDepenses.some((c: any) => c.id === d.id)),
    ];

    const totalRecettes = mergedRecettes.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalDepenses = mergedDepenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const netBalance = totalRecettes - totalDepenses;

    return NextResponse.json({
      recettes: mergedRecettes,
      depenses: mergedDepenses,
      metrics: {
        totalRecettes,
        totalDepenses,
        netBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, description, amount, supplier, paymentMode } = body;

    if (!category || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Catégorie et Montant valide requis." }, { status: 400 });
    }

    const count = await prisma.auditLog.count({ where: { action: "CREATE_EXPENSE" } });
    const reference = `DEP-2026-${String(count + 6).padStart(4, "0")}`;

    const expenseData = {
      id: `dep_${Date.now()}`,
      reference,
      category,
      description: description || category,
      amount: Number(amount),
      supplier: supplier || "Prestataire / Fournisseur",
      paymentMode: paymentMode || "ESPECES",
      createdAt: new Date().toISOString(),
    };

    try {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_EXPENSE",
          entity: "Expense",
          entityId: reference,
          details: JSON.stringify(expenseData),
        },
      });
    } catch (e) {}

    await updateCloudData((store) => {
      const existing = store.depenses || [];
      const updatedDep = [expenseData, ...existing.filter((d: any) => d.id !== expenseData.id)];
      return { ...store, depenses: updatedDep };
    });

    return NextResponse.json(expenseData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
