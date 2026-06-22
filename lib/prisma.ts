import { PrismaClient } from "../app/generated/prisma/client"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
const globalForPrisma = global as unknown as {
  prismaV3: PrismaClient; 
}; 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 
const prisma =
  globalForPrisma.prismaV3 ||
  new PrismaClient({
    adapter, 
  }); 
if (process.env.NODE_ENV !== "production") globalForPrisma.prismaV3 = prisma; 
export default prisma;