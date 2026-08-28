import { NextResponse } from "next/server";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, email, fullName, phone } = body;

    if (!customerId || !email) {
      return NextResponse.json({ error: "customerId et email requis." }, { status: 400 });
    }

    const cloudData = await getCloudData();
    const users = (cloudData as any).users || [];

    const existing = users.find((u: any) => u.email === email || u.customerId === customerId);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe deja pour cette cliente.", existingEmail: existing.email }, { status: 409 });
    }

    const tempPassword = generateTempPassword();
    const newUser = {
      id: `usr_client_${Date.now()}`,
      email,
      fullName: fullName || "Cliente GY",
      role: "CLIENT",
      customerId,
      phone: phone || "",
      passwordHash: hashPassword(tempPassword),
      tempPassword,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    await updateCloudData((store) => {
      const updatedUsers = [...((store as any).users || []), newUser];
      return { ...store, users: updatedUsers } as any;
    });

    return NextResponse.json({
      success: true,
      credentials: { email, tempPassword, fullName: newUser.fullName },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cloudData = await getCloudData();
    const users = ((cloudData as any).users || []).filter((u: any) => u.role === "CLIENT");
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur manquant." }, { status: 400 });
    }
    await updateCloudData((store) => {
      const updatedUsers = ((store as any).users || []).filter((u: any) => u.id !== userId);
      return { ...store, users: updatedUsers } as any;
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
