import { PrismaClient, UserRole } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
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
  console.log("Starting seed process...");

  // 2. Create Users
  const users = [
    { id: "user_super_admin", name: "Super Admin", email: "admin@example.com", password: "Admin@123", role: UserRole.SUPER_ADMIN, isActive: true, branchId: null },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        branchId: user.branchId,
        emailVerified: new Date(),
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
        branchId: user.branchId,
        emailVerified: new Date(),
      },
    });
  }
  console.log("✅ Users seeded.");


  console.log("🎉 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });