import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch all customer payments (Recettes)
    const payments = await prisma.payment.findMany({
      include: {
        customer: true,
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch all expenses logged in audit log
    const auditExpenses = await prisma.auditLog.findMany({
      where: { action: "CREATE_EXPENSE" },
      orderBy: { createdAt: "desc" },
    });

    const expensesList = auditExpenses.map((a) => {
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

    // Seed default realistic expenses for demo if empty
    if (expensesList.length === 0) {
      const defaultExpenses = [
        {
          id: "dep-1",
          reference: "DEP-2026-0001",
          category: "Achat Tissus",
          description: "Lot 50m Satin Duchesse Noir & Mikado de Soie Impérial",
          amount: 450000,
          supplier: "Textiles d'Orient Cotonou",
          paymentMode: "ESPECES",
          createdAt: new Date(),
        },
        {
          id: "dep-2",
          reference: "DEP-2026-0002",
          category: "Mercerie & Accessoires",
          description: "Perles d'Or Swarovski 4mm & Boîtes de Zips Invisibles YKK",
          amount: 120000,
          supplier: "Mercerie Royale Ganhi",
          paymentMode: "MTN_MOBILE_MONEY",
          createdAt: new Date(Date.now() - 2 * 86400 * 1000),
        },
        {
          id: "dep-3",
          reference: "DEP-2026-0003",
          category: "Loyer Boutique & Atelier",
          description: "Loyer Mensuel Atelier Haute Couture Ganhi",
          amount: 350000,
          supplier: "SCI Immobilière du Golfe",
          paymentMode: "VIREMENT",
          createdAt: new Date(Date.now() - 5 * 86400 * 1000),
        },
        {
          id: "dep-4",
          reference: "DEP-2026-0004",
          category: "Salaires & Commissions",
          description: "Acompte sur Salaire Chef Coupeur Marc Agbodjan",
          amount: 150000,
          supplier: "Marc Agbodjan (Employé)",
          paymentMode: "ESPECES",
          createdAt: new Date(Date.now() - 7 * 86400 * 1000),
        },
        {
          id: "dep-5",
          reference: "DEP-2026-0005",
          category: "Électricité SBEE / SONEB",
          description: "Facture Électricité SBEE Machines à Coudre & Repassage",
          amount: 65000,
          supplier: "SBEE Bénin",
          paymentMode: "MOOV_MONEY",
          createdAt: new Date(Date.now() - 10 * 86400 * 1000),
        },
      ];
      expensesList.push(...defaultExpenses);
    }

    const totalRecettes = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalDepenses = expensesList.reduce((acc, e) => acc + e.amount, 0);
    const netBalance = totalRecettes - totalDepenses;

    return NextResponse.json({
      recettes: payments,
      depenses: expensesList,
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
      reference,
      category,
      description: description || category,
      amount: Number(amount),
      supplier: supplier || "Prestataire / Fournisseur",
      paymentMode: paymentMode || "ESPECES",
    };

    await prisma.auditLog.create({
      data: {
        action: "CREATE_EXPENSE",
        entity: "Expense",
        entityId: reference,
        details: JSON.stringify(expenseData),
      },
    });

    return NextResponse.json(expenseData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
