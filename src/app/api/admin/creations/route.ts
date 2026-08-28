import { NextResponse } from "next/server";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

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
    const cloudData = await getCloudData();
    const serverCreations = (cloudData as any).creations;
    if (serverCreations && Array.isArray(serverCreations) && serverCreations.length > 0) {
      return NextResponse.json(serverCreations);
    }
    await updateCloudData((store) => ({
      ...store,
      creations: DEFAULT_CREATIONS,
    } as any));
    return NextResponse.json(DEFAULT_CREATIONS);
  } catch (error: any) {
    return NextResponse.json(DEFAULT_CREATIONS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, reference, title, category, description, fabric, badge, priceEstimate, deliveryDelay, image, active } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Titre et catégorie requis" }, { status: 400 });
    }

    const cloudData = await getCloudData();
    const currentCreations = (cloudData as any).creations || DEFAULT_CREATIONS;

    let updatedList: any[] = [];
    if (id) {
      // Edit existing
      updatedList = currentCreations.map((c: any) =>
        c.id === id
          ? {
              ...c,
              reference: reference || c.reference,
              title,
              category,
              description: description || c.description,
              fabric: fabric || c.fabric,
              badge: badge || c.badge,
              priceEstimate: priceEstimate || c.priceEstimate,
              deliveryDelay: deliveryDelay || c.deliveryDelay,
              image: image || c.image,
              active: active !== undefined ? active : c.active,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
    } else {
      // Create new
      const newCreation = {
        id: `cr_${Date.now()}`,
        reference: reference || `MOD-GY-2026-${String(currentCreations.length + 1).padStart(2, "0")}`,
        title,
        category,
        description: description || "",
        fabric: fabric || "",
        badge: badge || "NOUVELLE CRÉATION",
        priceEstimate: priceEstimate || "Sur mesure",
        deliveryDelay: deliveryDelay || "7 à 10 jours",
        image: image || "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
        active: true,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newCreation, ...currentCreations];
    }

    await updateCloudData((store) => ({
      ...store,
      creations: updatedList,
    } as any));

    return NextResponse.json({ success: true, creations: updatedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }
    const cloudData = await getCloudData();
    const currentCreations = (cloudData as any).creations || DEFAULT_CREATIONS;
    const updatedList = currentCreations.filter((c: any) => c.id !== id);

    await updateCloudData((store) => ({
      ...store,
      creations: updatedList,
    } as any));

    return NextResponse.json({ success: true, creations: updatedList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
