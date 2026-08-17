import { NextResponse } from "next/server";
import { getCloudData, updateCloudData } from "@/lib/cloudDb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cloudData = await getCloudData();
    const employees = cloudData.employees || [];
    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, role, department, phone, email, contractType, salary, hireDate } = body;

    if (!firstName || !lastName || !role) {
      return NextResponse.json({ error: "Prénom, Nom et Rôle sont requis." }, { status: 400 });
    }

    const cloudData = await getCloudData();
    const existing = cloudData.employees || [];
    const empCode = `EMP-${String(existing.length + 1).padStart(3, "0")}`;

    const newEmp = {
      id: `emp_${Date.now()}`,
      code: empCode,
      firstName,
      lastName,
      role,
      department: department || "Atelier Confection",
      phone: phone || "+229 97 00 00 00",
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mygy.com`,
      contractType: contractType || "CDI",
      salary: Number(salary || 150000),
      hireDate: hireDate || new Date().toISOString().split("T")[0],
      status: "ACTIF",
      createdAt: new Date().toISOString(),
    };

    await updateCloudData((store) => {
      const currentEmps = store.employees || [];
      const updated = [newEmp, ...currentEmps.filter((e: any) => e.id !== newEmp.id)];
      return { ...store, employees: updated };
    });

    return NextResponse.json(newEmp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
