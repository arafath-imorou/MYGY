import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudData, DEFAULT_CREATION_CATEGORIES, DEFAULT_CREATION_BADGES } from "@/lib/cloudDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CREATIONS = [
  {
    id: "cr_1",
    reference: "MOD-GY-2026-01",
    title: "Robe Sirène Soie Sauvage & Perles Swarovski",
    category: "ROBES DE SOIRÉE & GALA",
    description: "Coupe sirène sculptante en soie sauvage avec incrustations manuelles de perles et cristaux Swarovski. Fente latérale discrète et traîne impériale.",
    fabric: "Soie Sauvage, Dentelle Perlée, Cristaux Swarovski",
    badge: "COLLECTION 2026",
    priceEstimate: "Sur mesure",
    deliveryDelay: "7 à 10 jours",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "cr_2",
    reference: "MOD-GY-2026-02",
    title: "Boubou Royal Grand Duc Brodé Fil d'Or",
    category: "BOUBOUS VIP & CAFTANS",
    description: "Boubou d'apparat en Bazin Riche Getzner teinté artisanalement, orné de broderies fines au fil d'or 24 carats au col et aux manches.",
    fabric: "Bazin Riche Getzner 1ère Qualité, Broderie Fil d'Or",
    badge: "BEST-SELLER VIP",
    priceEstimate: "Sur mesure",
    deliveryDelay: "5 à 7 jours",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "cr_3",
    reference: "MOD-GY-2026-03",
    title: "Ensemble Tailleur Prestige Crêpe & Satin Duchesse",
    category: "ENSEMBLES TAILLEURS & COMBINAISONS",
    description: "Veste cintrée à revers en satin duchesse brillant, pantalon palazzo taille haute à pinces parfaites. Idéal pour réceptions officielles et événements d'affaires.",
    fabric: "Crêpe Lourd Haute Couture & Satin Duchesse",
    badge: "ÉLÉGANCE BUSINESS",
    priceEstimate: "Sur mesure",
    deliveryDelay: "6 à 8 jours",
    image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-08T10:00:00.000Z",
  },
  {
    id: "cr_4",
    reference: "MOD-GY-2026-04",
    title: "Robe de Mariée Princesse Organza & Dentelle de Calais",
    category: "CRÉATIONS MARIAGE & CÉRÉMONIE",
    description: "Bustier cœur brodé main en dentelle de Calais avec jupon voluptueux en organza de soie multicouches et traîne royale cathédrale.",
    fabric: "Organza de Soie, Dentelle de Calais, Tulle Illusion",
    badge: "MARIAGE VIP",
    priceEstimate: "Sur mesure",
    deliveryDelay: "14 à 21 jours",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "cr_5",
    reference: "MOD-GY-2026-05",
    title: "Caftan Majestueux Velours de Soie & Pierreries",
    category: "BOUBOUS VIP & CAFTANS",
    description: "Caftan moderne ceinturé en velours de soie pourpre, orné d'améthystes brodées à la main et sfifa dorée traditionnelle revisitée.",
    fabric: "Velours de Soie Pourpre, Sfifa Dorée, Pierres Fines",
    badge: "HAUTE COUTURE",
    priceEstimate: "Sur mesure",
    deliveryDelay: "8 à 12 jours",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "cr_6",
    reference: "MOD-GY-2026-06",
    title: "Ensemble Cérémonie Pagne Tissé & Soie Mikado",
    category: "HAUTE COUTURE TRADITIONNELLE",
    description: "Alliance unique entre le noble pagne tissé traditionnel béninois et la rigidité sculpturale du Mikado de soie pour une silhouette intemporelle.",
    fabric: "Kanvo / Pagne Tissé Main & Mikado de Soie",
    badge: "SIGNATURE GY",
    priceEstimate: "Sur mesure",
    deliveryDelay: "7 à 10 jours",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    active: true,
    createdAt: "2026-08-15T10:00:00.000Z",
  },
];

export async function GET() {
  try {
    // 1. Fetch Cloud DB once (cached with short TTL in memory)
    const cloudData = await getCloudData();
    const cloudOrders = cloudData.orders || [];
    const cloudCusts = cloudData.customers || [];
    const cloudRecettes = cloudData.recettes || [];
    const cloudDepenses = cloudData.depenses || [];
    const cloudEmployees = cloudData.employees || [];
    const cloudUsers = (cloudData as any).users || [];
    const cloudStock = (cloudData as any).stock || [];
    const cloudCreations = (cloudData as any).creations && Array.isArray((cloudData as any).creations) && (cloudData as any).creations.length > 0
      ? (cloudData as any).creations
      : DEFAULT_CREATIONS;

    // 2. Optional Prisma queries with safe fallbacks
    let dbOrders: any[] = [];
    let dbCustomers: any[] = [];
    let dbPayments: any[] = [];
    let dbUsers: any[] = [];
    let inventory: any[] = [];
    let auditExpenses: any[] = [];

    try {
      [dbOrders, dbCustomers, dbPayments, dbUsers, inventory, auditExpenses] = await Promise.all([
        prisma.order.findMany({
          include: { customer: true, items: true, payments: true },
          orderBy: { createdAt: "desc" },
        }).catch(() => []),
        prisma.customer.findMany({
          include: {
            measurements: { orderBy: { takenAt: "desc" } },
            orders: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" } },
            appointments: true,
            loyaltyAccount: true,
          },
          orderBy: { createdAt: "desc" },
        }).catch(() => []),
        prisma.payment.findMany({
          include: { customer: true, order: true },
          orderBy: { createdAt: "desc" },
        }).catch(() => []),
        prisma.user.findMany({
          select: { id: true, email: true, fullName: true, role: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }).catch(() => []),
        prisma.inventoryItem.findMany().catch(() => []),
        prisma.auditLog.findMany({
          where: { action: "CREATE_EXPENSE" },
          orderBy: { createdAt: "desc" },
        }).catch(() => []),
      ]);
    } catch (e) {
      // Prisma error fallback - ignore silently
    }

    // Merged Orders
    const mergedOrders = [...cloudOrders, ...dbOrders.filter((p: any) => !cloudOrders.some((c: any) => c.id === p.id))];

    // Merged Customers with their orders
    const mergedCustsRaw = [...cloudCusts, ...dbCustomers.filter((p: any) => !cloudCusts.some((c: any) => c.id === p.id))];
    const mergedCusts = mergedCustsRaw.map((c: any) => {
      const cOrders = mergedOrders.filter((o: any) => o.customerId === c.id || o.customerId === c.code || o.customer?.id === c.id || o.customer?.code === c.code);
      return {
        ...c,
        orders: cOrders.length > 0 ? cOrders : (c.orders || []),
      };
    });

    // Merged Recettes from order payments & direct payments
    const orderPayments: any[] = [];
    mergedOrders.forEach((o: any) => {
      if (o.payments && Array.isArray(o.payments) && o.payments.length > 0) {
        o.payments.forEach((p: any) => {
          orderPayments.push({
            id: p.id || `pay_${o.id}_${Date.now()}`,
            receiptNumber: p.receiptNumber || `REC-2026-${String(orderPayments.length + 1).padStart(4, "0")}`,
            orderId: o.id,
            customerId: o.customerId,
            amount: Number(p.amount || 0),
            paymentMode: p.paymentMode || "ESPECES",
            transactionRef: p.transactionRef || "",
            receivedBy: p.receivedBy || "Ghislaine LOKO DJIDJOHO",
            createdAt: p.createdAt || o.createdAt || new Date().toISOString(),
            order: { reference: o.reference || "ORD-2026-0001" },
            customer: o.customer || null,
          });
        });
      } else if (Number(o.totalPaid || 0) > 0) {
        orderPayments.push({
          id: `pay_${o.id}`,
          receiptNumber: `REC-2026-${String(orderPayments.length + 1).padStart(4, "0")}`,
          orderId: o.id,
          customerId: o.customerId,
          amount: Number(o.totalPaid),
          paymentMode: "ESPECES",
          transactionRef: "",
          receivedBy: "Ghislaine LOKO DJIDJOHO",
          createdAt: o.createdAt || new Date().toISOString(),
          order: { reference: o.reference || "ORD-2026-0001" },
          customer: o.customer || null,
        });
      }
    });

    const mergedRecettes = [...cloudRecettes];
    orderPayments.forEach((op) => {
      if (!mergedRecettes.some((r) => r.id === op.id || r.receiptNumber === op.receiptNumber || (r.orderId === op.orderId && r.amount === op.amount))) {
        mergedRecettes.push(op);
      }
    });
    dbPayments.forEach((dp) => {
      if (!mergedRecettes.some((r) => r.id === dp.id)) {
        mergedRecettes.push(dp);
      }
    });

    // Merged Dépenses
    const dbExpensesList = auditExpenses.map((a: any) => {
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
      ...dbExpensesList.filter((d: any) => !cloudDepenses.some((c: any) => c.id === d.id)),
    ];

    // Finance Metrics
    const totalRecettes = mergedRecettes.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalDepenses = mergedDepenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const netBalance = totalRecettes - totalDepenses;

    // Dashboard metrics
    let totalRevenueMonth = 0;
    let totalCollected = 0;
    let totalReceivables = 0;
    mergedOrders.forEach((o: any) => {
      totalRevenueMonth += Number(o.totalAmount || 0);
      totalCollected += Number(o.totalPaid || 0);
      totalReceivables += Number(o.balanceDue || 0);
    });
    const lowStockItems = inventory.filter((i: any) => i.availableStock <= i.minThreshold);
    const recentOrders = mergedOrders.slice(0, 5);

    // Users
    const mergedUsers = [...cloudUsers, ...dbUsers.filter((u: any) => !cloudUsers.some((c: any) => c.id === u.id))];

    // Client Accounts
    const clientAccounts = cloudUsers.filter((u: any) => u.role === "CLIENT");

    // Config (Categories & Badges)
    const creationCategories = (cloudData as any).creationCategories && (cloudData as any).creationCategories.length > 0
      ? (cloudData as any).creationCategories
      : DEFAULT_CREATION_CATEGORIES;
    const creationBadges = (cloudData as any).creationBadges && (cloudData as any).creationBadges.length > 0
      ? (cloudData as any).creationBadges
      : DEFAULT_CREATION_BADGES;

    return NextResponse.json({
      dashboard: {
        metrics: {
          totalRevenueMonth,
          totalCollected,
          totalReceivables,
          totalOrders: mergedOrders.length,
          lowStockCount: lowStockItems.length,
        },
        recentOrders,
        lowStockItems,
      },
      orders: mergedOrders,
      customers: mergedCusts,
      finances: {
        recettes: mergedRecettes,
        depenses: mergedDepenses,
        metrics: {
          totalRecettes,
          totalDepenses,
          netBalance,
        },
      },
      employees: cloudEmployees,
      users: mergedUsers,
      stock: cloudStock,
      clientAccounts,
      creations: cloudCreations,
      config: {
        categories: creationCategories,
        badges: creationBadges,
      },
    }, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      }
    });
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: error.message || "Erreur de synchronisation" }, { status: 500 });
  }
}
