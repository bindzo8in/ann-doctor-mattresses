import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting pre-migration data cleanup...");

  // Find all orders with status REFUND_INITIATED or REFUNDED
  // Since we are using Prisma client generated BEFORE the schema change,
  // these enum values are still valid.
  const ordersToUpdate = await prisma.order.findMany({
    where: {
      status: {
        in: ["REFUND_INITIATED", "REFUNDED"] as any, // Cast to any to avoid type errors if we re-run later
      }
    }
  });

  console.log(`Found ${ordersToUpdate.length} orders to migrate.`);

  for (const order of ordersToUpdate) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" as any },
    });
    console.log(`Updated order ${order.orderNumber} status to CANCELLED`);
  }

  console.log("Pre-migration data cleanup complete.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
