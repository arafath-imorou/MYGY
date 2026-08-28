import { NextResponse } from "next/server";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanIdentifier(name: string): string {
  if (!name) return "gyclient";
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `gy${normalized || "client"}`;
}

function generateSimplePassword(): string {
  // Simple password without symbols: gy + 4 random digits (ex: gy4821)
  const num = Math.floor(1000 + Math.random() * 9000);
  return `gy${num}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cloudData = await getCloudData();
    const existingUsers = (cloudData as any).users || [];
    const customers = (cloudData as any).customers || [];

    // Mode 1: Générer des comptes pour TOUS les clients existants
    if (body.action === "generate_all") {
      const createdAccounts: any[] = [];
      const newUsers = [...existingUsers];

      for (const cust of customers) {
        const alreadyHasAccount = newUsers.some(
          (u: any) => u.customerId === cust.id || (cust.email && u.email?.toLowerCase() === cust.email.toLowerCase())
        );

        if (!alreadyHasAccount) {
          const rawFirstName = cust.firstName || cust.name || cust.lastName || "client";
          let baseUsername = cleanIdentifier(rawFirstName);
          let username = baseUsername;
          let counter = 2;
          while (newUsers.some((u: any) => u.username === username || u.email === username)) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          const tempPassword = generateSimplePassword();
          const email = cust.email && cust.email.includes("@") ? cust.email : `${username}@mygy.com`;
          const fullName = `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.name || "Cliente GY";

          const newUser = {
            id: `usr_client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            email,
            username,
            fullName,
            role: "CLIENT",
            customerId: cust.id,
            customerCode: cust.code || "",
            phone: cust.phone || "",
            passwordHash: hashPassword(tempPassword),
            tempPassword,
            mustChangePassword: true,
            createdAt: new Date().toISOString(),
          };

          newUsers.push(newUser);
          createdAccounts.push({
            id: newUser.id,
            customerId: cust.id,
            fullName,
            username,
            email,
            tempPassword,
          });
        }
      }

      if (createdAccounts.length > 0) {
        await updateCloudData((store) => ({
          ...store,
          users: newUsers,
        } as any));
      }

      return NextResponse.json({
        success: true,
        count: createdAccounts.length,
        createdAccounts,
        totalClientAccounts: newUsers.filter((u: any) => u.role === "CLIENT").length,
      });
    }

    // Mode 2: Création individuelle d'un compte client
    const { customerId, email, fullName, phone, firstName } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId requis." }, { status: 400 });
    }

    const cust = customers.find((c: any) => c.id === customerId);
    const rawFirstName = firstName || cust?.firstName || fullName?.split(" ")[0] || "client";
    let baseUsername = cleanIdentifier(rawFirstName);
    let username = baseUsername;
    let counter = 2;
    while (existingUsers.some((u: any) => u.username === username || u.email === username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const targetEmail = email && email.includes("@") ? email : `${username}@mygy.com`;

    const existing = existingUsers.find(
      (u: any) => u.customerId === customerId || u.email === targetEmail || u.username === username
    );

    if (existing) {
      return NextResponse.json({
        error: "Un compte existe déjà pour cette cliente.",
        existingEmail: existing.email,
        existingUsername: existing.username,
      }, { status: 409 });
    }

    const tempPassword = generateSimplePassword();
    const finalFullName = fullName || (cust ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() : "Cliente GY");

    const newUser = {
      id: `usr_client_${Date.now()}`,
      email: targetEmail,
      username,
      fullName: finalFullName,
      role: "CLIENT",
      customerId,
      customerCode: cust?.code || "",
      phone: phone || cust?.phone || "",
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
      credentials: {
        email: targetEmail,
        username,
        tempPassword,
        fullName: newUser.fullName,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cloudData = await getCloudData();
    const existingUsers = (cloudData as any).users || [];
    const customers = (cloudData as any).customers || [];

    let updatedUsers = [...existingUsers];
    let hasNew = false;

    for (const cust of customers) {
      const alreadyHas = updatedUsers.some(
        (u: any) => u.customerId === cust.id || (cust.email && u.email?.toLowerCase() === cust.email.toLowerCase())
      );

      if (!alreadyHas) {
        const rawFirstName = cust.firstName || cust.name || cust.lastName || "client";
        let baseUsername = cleanIdentifier(rawFirstName);
        let username = baseUsername;
        let counter = 2;
        while (updatedUsers.some((u: any) => u.username === username || u.email === username)) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const tempPassword = generateSimplePassword();
        const email = cust.email && cust.email.includes("@") ? cust.email : `${username}@mygy.com`;
        const fullName = `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.name || "Cliente GY";

        const newUser = {
          id: `usr_client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email,
          username,
          fullName,
          role: "CLIENT",
          customerId: cust.id,
          customerCode: cust.code || "",
          phone: cust.phone || "",
          passwordHash: hashPassword(tempPassword),
          tempPassword,
          mustChangePassword: true,
          createdAt: cust.createdAt || new Date().toISOString(),
        };

        updatedUsers.push(newUser);
        hasNew = true;
      }
    }

    if (hasNew) {
      await updateCloudData((store) => ({
        ...store,
        users: updatedUsers,
      } as any));
    }

    const clientUsers = updatedUsers.filter((u: any) => u.role === "CLIENT");
    return NextResponse.json(clientUsers);
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
