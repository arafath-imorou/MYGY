import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(pwd: string) {
  return `hashed_${pwd}_gy2026`;
}

async function main() {
  console.log("🌱 Demarrage du Seeding de la base de donnees Centralised ERP GY MAISON COUTURE...");

  // 1. CLEAR EXISTING DATA
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.sAVTicket.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.fabricDetail.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.qualityCheck.deleteMany();
  await prisma.alteration.deleteMany();
  await prisma.fitting.deleteMany();
  await prisma.atelierIssue.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.productionJob.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customerMeasurement.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.prospect.deleteMany();
  await prisma.fashionModel.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Base nettoyee avec succes.");

  // 2. CREATE USERS & EMPLOYEES
  const superAdminUser = await prisma.user.create({
    data: {
      email: "admin@gy-maisoncouture.bj",
      fullName: "Grace Yessoufou (Direction)",
      passwordHash: hashPassword("demo123"),
      role: "SUPER_ADMIN",
      phone: "+229 97 00 00 01",
      employee: {
        create: {
          matricule: "EMP-001",
          jobTitle: "Directrice Générale",
          department: "Direction",
          contractType: "CDI",
          salaryBase: 1500000,
        },
      },
    },
  });

  const atelierMgrUser = await prisma.user.create({
    data: {
      email: "atelier@gy-maisoncouture.bj",
      fullName: "Koffi Mensah (Chef Atelier)",
      passwordHash: hashPassword("demo123"),
      role: "RESPONSABLE_ATELIER",
      phone: "+229 97 00 00 02",
      employee: {
        create: {
          matricule: "EMP-002",
          jobTitle: "Responsable Atelier",
          department: "Production",
          contractType: "CDI",
          salaryBase: 650000,
        },
      },
    },
  });

  const couturierUser = await prisma.user.create({
    data: {
      email: "couturier@gy-maisoncouture.bj",
      fullName: "Ablawa Dossou (Maître Couturière)",
      passwordHash: hashPassword("demo123"),
      role: "COUTURIER",
      phone: "+229 97 00 00 03",
      employee: {
        create: {
          matricule: "EMP-003",
          jobTitle: "Couturière Senior",
          department: "Production",
          contractType: "CDI",
          salaryBase: 350000,
        },
      },
    },
  });

  // 3. CREATE CUSTOMERS & DEMO USERS
  const client1User = await prisma.user.create({
    data: {
      email: "client1@gmail.com",
      fullName: "Princesse Yasmine Bio",
      passwordHash: hashPassword("demo123"),
      role: "CLIENT",
      phone: "+229 96 11 22 33",
    },
  });

  const client1 = await prisma.customer.create({
    data: {
      userId: client1User.id,
      code: "CLI-2026-0001",
      firstName: "Yasmine",
      lastName: "Bio",
      gender: "F",
      phone: "+229 96 11 22 33",
      email: "client1@gmail.com",
      city: "Cotonou",
      country: "Bénin",
      profession: "Diplomate",
      category: "VVIP",
      acquisitionSource: "Recommandation",
      notes: "Cliente exigeante, privilégier la soie Mikado et finitions d'or.",
      loyaltyAccount: {
        create: {
          tier: "GY VIP Diamond",
          points: 4850,
        },
      },
    },
  });

  const client2User = await prisma.user.create({
    data: {
      email: "client2@gmail.com",
      fullName: "Madame Sophie Lawson",
      passwordHash: hashPassword("demo123"),
      role: "CLIENT",
      phone: "+229 95 44 55 66",
    },
  });

  const client2 = await prisma.customer.create({
    data: {
      userId: client2User.id,
      code: "CLI-2026-0002",
      firstName: "Sophie",
      lastName: "Lawson",
      gender: "F",
      phone: "+229 95 44 55 66",
      email: "client2@gmail.com",
      city: "Porto-Novo",
      country: "Bénin",
      profession: "Avocate d'Affaires",
      category: "Premium",
      acquisitionSource: "Instagram",
      loyaltyAccount: {
        create: {
          tier: "GY Gold",
          points: 1200,
        },
      },
    },
  });

  // 4. MEASUREMENTS
  await prisma.customerMeasurement.create({
    data: {
      customerId: client1.id,
      poitrine: 92,
      sousPoitrine: 78,
      taille: 68,
      hanches: 98,
      carrure: 38,
      epaule: 12,
      bras: 30,
      poignet: 16,
      hauteurPoitrine: 26,
      ecartPoitrine: 19,
      longueurCorsage: 42,
      longueurDos: 40,
      hauteurBassin: 20,
      longueurRobe: 155,
      longueurJupe: 110,
      hauteurTotale: 172,
      morphologie: "8",
      posture: "Cambrée",
      preferedEase: "Ajusté",
      notes: "Poitrine galbée, traîne de robe de 1m50 souhaitée.",
    },
  });

  // 5. COLLECTIONS & MODELS
  const collPrestige = await prisma.collection.create({
    data: {
      name: "Collection Royale Cotonou 2026",
      code: "COL-2026-ROYAL",
      concept: "Haute Couture Africaine alliant Soie Mikado et Broderies d'Or de Parakou",
      season: "Automne-Hiver",
      year: 2026,
      budget: 15000000,
    },
  });

  const model1 = await prisma.fashionModel.create({
    data: {
      code: "MOD-2026-001",
      name: "Robe Sika Impériale",
      category: "Robe de Mariée / Gala",
      description: "Robe sirène majestueuse en soie mikado ivoire avec incrustations de perles de verre et fils d'or.",
      collectionId: collPrestige.id,
      indicativePrice: 1200000,
      estimatedCost: 450000,
      difficultyLevel: "Expert",
      averageHours: 45,
    },
  });

  // 6. INVENTORY & FABRICS
  const fabricMikado = await prisma.inventoryItem.create({
    data: {
      reference: "TIS-MIK-001",
      name: "Mikado de Soie Impérial Ivoire",
      category: "Tissu",
      unit: "Mètre",
      color: "Ivoire",
      physicalStock: 45,
      reservedStock: 12,
      availableStock: 33,
      minThreshold: 10,
      unitCost: 35000,
      supplierName: "Maison Tissus de Lyon",
      fabricDetails: {
        create: {
          composition: "100% Soie Natural",
          widthMeters: 1.5,
          batchLot: "LOT-2026-A",
        },
      },
    },
  });

  // 7. ORDERS & WORKFLOW
  const order1 = await prisma.order.create({
    data: {
      reference: "ORD-2026-0001",
      customerId: client1.id,
      promisedDate: new Date(Date.now() + 15 * 86400 * 1000),
      priority: "VIP",
      status: "PRODUCTION",
      clientStepStatus: "CONFECTION_EN_COURS",
      totalAmount: 1200000,
      depositRequired: 600000,
      totalPaid: 600000,
      balanceDue: 600000,
      items: {
        create: [
          {
            fashionModelId: model1.id,
            itemName: "Robe Sika Impériale Sur-Mesure",
            fabricDetails: "Mikado de Soie Impérial Ivoire (6m)",
            price: 1200000,
            estimatedCost: 450000,
            realCost: 410000,
            currentStage: "COUTURE",
            productionJobs: {
              create: [
                {
                  stage: "COUPE",
                  status: "TERMINE",
                  assignedRole: "COUPEUR",
                  qrCode: "QR-JOB-001-COUPE",
                  completedAt: new Date(Date.now() - 2 * 86400 * 1000),
                },
                {
                  stage: "COUTURE",
                  status: "EN_COURS",
                  assignedRole: "COUTURIER",
                  qrCode: "QR-JOB-001-COUTURE",
                  startedAt: new Date(Date.now() - 1 * 86400 * 1000),
                },
                {
                  stage: "BRODERIE",
                  status: "A_FAIRE",
                  assignedRole: "BRODEUR",
                  qrCode: "QR-JOB-001-BRODERIE",
                },
              ],
            },
          },
        ],
      },
      payments: {
        create: [
          {
            receiptNumber: "REC-2026-0001",
            customerId: client1.id,
            amount: 600000,
            paymentMode: "MTN_MOBILE_MONEY",
            transactionRef: "MTN-REF-998877",
            receivedBy: "Nadine Houessou",
            notes: "Acompte de 50% reçu à la commande",
          },
        ],
      },
      fittings: {
        create: [
          {
            fittingNumber: 1,
            fittingDate: new Date(Date.now() + 5 * 86400 * 1000),
            status: "PLANIFIE",
            observations: "Premier essayage de toile et ajustement de carrure",
          },
        ],
      },
      stockReservations: {
        create: [
          {
            inventoryItemId: fabricMikado.id,
            quantity: 6,
          },
        ],
      },
    },
  });

  console.log("✅ SEED TERMINÉ AVEC SUCCÈS POUR GY MAISON COUTURE !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
