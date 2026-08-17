const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const custs = await prisma.customer.findMany({
      include: { orders: true, measurements: true }
    });
    const orders = await prisma.order.findMany({
      include: { customer: true, items: true, payments: true }
    });
    console.log('--- SQLITE DB CUSTOMERS ---', custs.length);
    console.log(JSON.stringify(custs, null, 2));
    console.log('--- SQLITE DB ORDERS ---', orders.length);
    console.log(JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
