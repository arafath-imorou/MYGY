import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma findMany users fallback:", e);
    }

    const cloudData = await getCloudData();
    const cloudUsers = (cloudData as any).users || [];

    const merged = [...cloudUsers, ...dbUsers.filter((u) => !cloudUsers.some((c: any) => c.id === u.id))];

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, Nom complet et Mot de passe sont obligatoires." }, { status: 400 });
    }

    const userRole = role || "SUPER_ADMIN";
    const passwordHash = hashPassword(password);
    let userResult: any = null;

    try {
      userResult = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: userRole,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (createErr) {
      console.warn("Prisma User Create fallback:", createErr);
      userResult = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        role: userRole,
        createdAt: new Date().toISOString(),
      };
    }

    // Save to Cloud Store so all devices see the new admin user
    await updateCloudData((store: any) => {
      const existing = store.users || [];
      const updatedUsers = [userResult, ...existing.filter((u: any) => u.id !== userResult.id)];
      return { ...store, users: updatedUsers };
    });

    return NextResponse.json({ success: true, user: userResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
