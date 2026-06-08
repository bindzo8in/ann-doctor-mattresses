import { config } from "dotenv";
config();
import { PrismaClient, RefundStatus } from "../app/generated/prisma/client";
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
  console.log("Starting post-migration data backfill...");

  const refundedPayments = await prisma.payment.findMany({
    where: {
      status: "REFUNDED"
    }
  });

  console.log(`Found ${refundedPayments.length} fully refunded payments.`);

  for (const payment of refundedPayments) {
    const existingRefund = await prisma.refund.findFirst({
      where: { paymentId: payment.id }
    });

    if (!existingRefund) {
      await prisma.refund.create({
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          status: RefundStatus.COMPLETED,
          reason: "Legacy refund backfilled from migration",
          processedAt: new Date(),
        }
      });
      console.log(`Backfilled refund for payment ${payment.id}`);
    }
  }

  console.log("Post-migration data backfill complete.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
