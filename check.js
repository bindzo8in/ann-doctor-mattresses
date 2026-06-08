const { PrismaClient } = require('./app/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany({
    include: { mattressVariant: true },
    take: 20
  });
  variants.forEach(v => {
    if (v.mattressVariant) {
      console.log(`Size: ${v.mattressVariant.sizeName}, Thick: ${v.mattressVariant.thickness}, Dim: ${v.mattressVariant.length}x${v.mattressVariant.width}, Price: ${v.salePrice}`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
