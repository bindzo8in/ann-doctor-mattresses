const { PrismaClient } = require('./app/generated/prisma/client');
const prisma = new PrismaClient();
prisma.orderItem.deleteMany()
  .then(() => prisma.order.deleteMany())
  .then(() => console.log('Orders deleted'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
