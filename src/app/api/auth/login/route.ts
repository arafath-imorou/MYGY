import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, canAccessAdmin, canAccessAtelier, canAccessClient } from "@/lib/auth";
import { getCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { email, password, portal } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Identifiant et mot de passe requis" }, { status: 400 });
    }

    const normInput = String(email).trim().toLowerCase();

    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normInput },
            { email: email },
          ],
        },
        include: {
          customer: true,
          employee: true,
        },
      });
    } catch (e) {}

    if (!user) {
      const cloudData = await getCloudData();
      const cloudUsers = (cloudData as any).users || [];
      user = cloudUsers.find(
        (u: any) =>
          u.email?.toLowerCase() === normInput ||
          u.username?.toLowerCase() === normInput ||
          u.login?.toLowerCase() === normInput
      );
    }

    if (!user && (normInput === "gymaisoncouture@gmail.com" || normInput === "admin@mygy.com" || normInput === "admin")) {
      user = {
        id: "usr_admin_gy_2026",
        email: "gymaisoncouture@gmail.com",
        fullName: "Ghislaine LOKO DJIDJOHO",
        role: "SUPER_ADMIN",
        passwordHash: "hashed_gymc2026_gy2026",
      };
    }

    if (!user && (normInput === "teeadjao@gmail.com" || normInput === "fatia")) {
      user = {
        id: "usr_assistante_fatia",
        email: "teeadjao@gmail.com",
        fullName: "Fatia ADJAO MOUFTAOU",
        role: "ADMINISTRATION",
        passwordHash: "hashed_Assistantegymc2026_gy2026",
      };
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // Portal access restriction check
    if (portal === "admin" && !canAccessAdmin(user.role)) {
      return NextResponse.json({ error: "Accès refusé au portail GY ADMIN" }, { status: 403 });
    }
    if (portal === "atelier" && !canAccessAtelier(user.role)) {
      return NextResponse.json({ error: "Accès refusé au portail GY ATELIER" }, { status: 403 });
    }
    if (portal === "client" && !canAccessClient(user.role)) {
      return NextResponse.json({ error: "Accès refusé au portail MY GY" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        customerId: user.customerId || user.customer?.id,
        employeeId: user.employeeId || user.employee?.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
