import { NextResponse } from "next/server";
import { getCloudData, updateCloudData, DEFAULT_CREATION_CATEGORIES, DEFAULT_CREATION_BADGES } from "@/lib/cloudDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const cloudData = await getCloudData();
    const categories =
      (cloudData as any).creationCategories && (cloudData as any).creationCategories.length > 0
        ? (cloudData as any).creationCategories
        : DEFAULT_CREATION_CATEGORIES;

    const badges =
      (cloudData as any).creationBadges && (cloudData as any).creationBadges.length > 0
        ? (cloudData as any).creationBadges
        : DEFAULT_CREATION_BADGES;

    return NextResponse.json({
      success: true,
      categories,
      badges,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target, action, value, oldValue } = body;

    if (!target || !action || !value) {
      return NextResponse.json({ error: "Champs requis manquants (target, action, value)" }, { status: 400 });
    }

    const trimmedValue = String(value).trim().toUpperCase();
    const trimmedOldValue = oldValue ? String(oldValue).trim().toUpperCase() : "";

    const updated = await updateCloudData((store) => {
      let categories =
        (store as any).creationCategories && (store as any).creationCategories.length > 0
          ? [...(store as any).creationCategories]
          : [...DEFAULT_CREATION_CATEGORIES];

      let badges =
        (store as any).creationBadges && (store as any).creationBadges.length > 0
          ? [...(store as any).creationBadges]
          : [...DEFAULT_CREATION_BADGES];

      let creations = (store as any).creations ? [...(store as any).creations] : [];

      if (target === "category") {
        if (action === "add") {
          if (!categories.includes(trimmedValue)) {
            categories.push(trimmedValue);
          }
        } else if (action === "update") {
          categories = categories.map((c: string) => (c === trimmedOldValue ? trimmedValue : c));
          if (trimmedOldValue) {
            creations = creations.map((cr: any) =>
              cr.category === trimmedOldValue ? { ...cr, category: trimmedValue } : cr
            );
          }
        } else if (action === "delete") {
          categories = categories.filter((c: string) => c !== trimmedValue);
        }
      } else if (target === "badge") {
        if (action === "add") {
          if (!badges.includes(trimmedValue)) {
            badges.push(trimmedValue);
          }
        } else if (action === "update") {
          badges = badges.map((b: string) => (b === trimmedOldValue ? trimmedValue : b));
          if (trimmedOldValue) {
            creations = creations.map((cr: any) =>
              cr.badge === trimmedOldValue ? { ...cr, badge: trimmedValue } : cr
            );
          }
        } else if (action === "delete") {
          badges = badges.filter((b: string) => b !== trimmedValue);
        }
      }

      return {
        ...store,
        creationCategories: categories,
        creationBadges: badges,
        creations,
      } as any;
    });

    return NextResponse.json({
      success: true,
      categories: (updated as any).creationCategories,
      badges: (updated as any).creationBadges,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

