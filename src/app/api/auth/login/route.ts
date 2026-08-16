import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, canAccessAdmin, canAccessAtelier, canAccessClient } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, portal } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: true,
        employee: true,
      },
    });

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
        fullName: user.fullName,
        role: user.role,
        customerId: user.customer?.id,
        employeeId: user.employee?.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
