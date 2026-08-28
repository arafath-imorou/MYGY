import { NextResponse } from "next/server";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const cloudData = await getCloudData();
    const stock = (cloudData as any).stock || [];
    return NextResponse.json(stock);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, unit, quantity, minQuantity, type, reference, supplierInfo } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Nom et categorie requis." }, { status: 400 });
    }

    const newItem = {
      id: `stk_${Date.now()}`,
      reference: reference || `STK-${String(Date.now()).slice(-6)}`,
      name,
      category, // TISSU, FIL, AIGUILLE, ACCESSOIRE, EQUIPEMENT, AUTRE
      type: type || "CONSOMMABLE", // CONSOMMABLE ou EQUIPEMENT
      unit: unit || "m",
      quantity: Number(quantity || 0),
      minQuantity: Number(minQuantity || 0),
      supplierInfo: supplierInfo || "",
      movements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateCloudData((store) => {
      const existing = (store as any).stock || [];
      return { ...store, stock: [newItem, ...existing] } as any;
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, movement, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID article manquant." }, { status: 400 });
    }

    let updatedItem: any = null;

    await updateCloudData((store) => {
      const stock = (store as any).stock || [];
      const updatedStock = stock.map((item: any) => {
        if (item.id !== id) return item;

        let newQuantity = item.quantity;
        const newMovements = [...(item.movements || [])];

        if (movement) {
          const qty = Number(movement.quantity || 0);
          // ENTREE: +qty, SORTIE: -qty, MISE_A_DISPO: tracked but not consumed
          if (movement.type === "ENTREE") newQuantity += qty;
          else if (movement.type === "SORTIE") newQuantity = Math.max(0, newQuantity - qty);
          else if (movement.type === "RETOUR") newQuantity += qty;

          newMovements.unshift({
            id: `mv_${Date.now()}`,
            type: movement.type,
            quantity: qty,
            reason: movement.reason || "",
            orderId: movement.orderId || null,
            date: new Date().toISOString(),
            by: movement.by || "Admin",
          });
        }

        updatedItem = {
          ...item,
          ...updates,
          quantity: newQuantity,
          movements: newMovements,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      });

      return { ...store, stock: updatedStock } as any;
    });

    return NextResponse.json(updatedItem || { error: "Article introuvable" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID article manquant." }, { status: 400 });
    }

    await updateCloudData((store) => {
      const stock = (store as any).stock || [];
      return { ...store, stock: stock.filter((s: any) => s.id !== id) } as any;
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
