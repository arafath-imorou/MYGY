const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanData() {
  console.log("Beginning complete data wipe for GY MAISON COUTURE...");

  const models = [
    "payment",
    "fitting",
    "qualityCheck",
    "productionJob",
    "orderItem",
    "stockReservation",
    "order",
    "customerMeasurement",
    "appointment",
    "loyaltyAccount",
    "customer",
    "expense",
    "inventoryItem",
    "supplier",
    "taskAssignment",
    "commission",
    "auditLog",
    "notification",
    "comment"
  ];

  for (const model of models) {
    if (prisma[model] && typeof prisma[model].deleteMany === "function") {
      try {
        await prisma[model].deleteMany({});
        console.log(`Cleared model: ${model}`);
      } catch (err) {
        console.warn(`Could not clear ${model}:`, err.message);
      }
    }
  }

  console.log("Database wiped clean! All demo customers, orders, expenses, and figures removed.");
}

cleanData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
