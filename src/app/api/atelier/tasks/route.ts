import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get("qrCode");

    if (qrCode) {
      const job = await prisma.productionJob.findUnique({
        where: { qrCode },
        include: {
          orderItem: {
            include: {
              order: {
                include: { customer: true },
              },
              fashionModel: true,
            },
          },
          issues: true,
        },
      });

      if (!job) {
        return NextResponse.json({ error: "Pièce / QR Code non trouvé" }, { status: 404 });
      }

      return NextResponse.json(job);
    }

    const jobs = await prisma.productionJob.findMany({
      include: {
        orderItem: {
          include: {
            order: {
              include: {
                customer: {
                  select: {
                    id: true,
                    code: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            fashionModel: true,
          },
        },
        issues: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { jobId, action, issueType, issueDescription, reportedBy } = await req.json();

    const job = await prisma.productionJob.findUnique({
      where: { id: jobId },
      include: { orderItem: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
    }

    if (action === "START") {
      const updatedJob = await prisma.productionJob.update({
        where: { id: jobId },
        data: {
          status: "EN_COURS",
          startedAt: new Date(),
        },
      });
      return NextResponse.json(updatedJob);
    }

    if (action === "COMPLETE") {
      const updatedJob = await prisma.productionJob.update({
        where: { id: jobId },
        data: {
          status: "TERMINE",
          completedAt: new Date(),
        },
      });

      // Advance OrderItem current stage automatically
      await prisma.orderItem.update({
        where: { id: job.orderItemId },
        data: { currentStage: job.stage },
      });

      return NextResponse.json(updatedJob);
    }

    if (action === "REPORT_ISSUE") {
      const issue = await prisma.atelierIssue.create({
        data: {
          productionJobId: jobId,
          type: issueType || "Autre",
          description: issueDescription || "Problème signalé depuis l'atelier",
          reportedBy: reportedBy || "Artisan",
        },
      });

      await prisma.productionJob.update({
        where: { id: jobId },
        data: { status: "BLOQUE" },
      });

      return NextResponse.json(issue);
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
