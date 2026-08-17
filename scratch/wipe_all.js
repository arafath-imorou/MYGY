const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeAll() {
  try {
    await prisma.customerMeasurement.deleteMany({}).catch(() => null);
    await prisma.fitting.deleteMany({}).catch(() => null);
    await prisma.payment.deleteMany({}).catch(() => null);
    await prisma.order.deleteMany({}).catch(() => null);
    await prisma.customer.deleteMany({}).catch(() => null);
    console.log('--- PRISMA SQLITE DB WIPED TO ZERO ---');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

wipeAll();
