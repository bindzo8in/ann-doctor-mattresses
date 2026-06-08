import { PrismaClient, UserRole, OrderStatus, ProductType, Firmness, AgeGroup, WeightGroup, SleepingPosition, ComfortLevel, HealthBenefit, MattressSize } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

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

function generateFakeProduct(categoryId: string, imagesData: any[]) {
  const productName = faker.commerce.productName() + " Mattress";
  const slug = faker.helpers.slugify(productName).toLowerCase();
  
  // Base price for realistic variation
  const basePrice = faker.number.int({ min: 8000, max: 25000 });

  return {
    id: faker.string.uuid(),
    name: productName,
    slug: slug,
    type: "MATTRESS" as ProductType,
    shortDescription: [
      "Orthopedic spinal support",
      "Premium euro top comfort",
      "Medium firm feel",
      "Cooling airflow technology",
      "Motion isolation support",
      "10 year warranty",
      "Suitable for couples",
      "Ideal for back pain relief"
    ],
    categoryId: categoryId,
    thumbnailUrl: imagesData[0].url,
    thumbnailPublicId: imagesData[0].publicId,
    isFeatured: faker.datatype.boolean(0.3), // 30% chance of being featured
    isActive: true,
    allowCustomSize: true,
    minWidth: 30,
    maxWidth: 72,
    minLength: 72,
    maxLength: 84,
    customSizePricing: {
      "4": 250,
      "6": 300,
      "8": 350,
      "10": 400,
      "12": 450,
      "14": 500
    },
    sectionHeading: `Why Choose ${productName}?`,
    firmness: faker.helpers.arrayElement(["SOFT", "MEDIUM_SOFT", "MEDIUM", "MEDIUM_FIRM", "FIRM"]) as Firmness,
    comfortLevel: faker.helpers.arrayElement(["PLUSH", "BALANCED", "SUPPORTIVE"]) as ComfortLevel,
    healthBenefits: [
      "ORTHOPEDIC",
      "BACK_PAIN_RELIEF",
      "PRESSURE_RELIEF",
      "COOLING",
      "MOTION_ISOLATION"
    ] as HealthBenefit[],
    recommendedAgeGroups: ["ADULT", "SENIOR"] as AgeGroup[],
    recommendedWeightGroups: ["UNDER_60", "KG_60_80", "KG_80_100", "OVER_100"] as WeightGroup[],
    recommendedPositions: ["BACK", "SIDE", "COMBINATION"] as SleepingPosition[],
    basePrice
  };
}

async function main() {
  console.log("Starting seed process...");

  // Delete all data safely
  console.log("Cleaning database...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productFaq.deleteMany();
  await prisma.productSection.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.mattressVariant.deleteMany();
  await prisma.sofaVariant.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  // 1. Create Branches
  const branches = [
    { id: "branch_001", name: "Main Hub - NY", address: "123 Main St, NY", phone: "212-555-0001", isActive: true },
    { id: "branch_002", name: "South Branch - TX", address: "456 South Blvd, TX", phone: "713-555-0002", isActive: true },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: branch,
      create: branch,
    });
  }
  console.log("✅ Branches seeded.");

  // 2. Create Users
  const users = [
    { id: "user_super_admin", name: "Super Admin", email: "admin@example.com", password: "hashed_pwd_001", role: UserRole.SUPER_ADMIN, isActive: true, branchId: null },
    { id: "user_branch_admin_1", name: "Branch Admin NY", email: "branch1@example.com", password: "hashed_pwd_002", role: UserRole.BRANCH_ADMIN, isActive: true, branchId: "branch_001" },
    { id: "user_branch_admin_2", name: "Branch Admin TX", email: "branch2@example.com", password: "hashed_pwd_003", role: UserRole.BRANCH_ADMIN, isActive: true, branchId: "branch_002" },
    { id: "user_customer_1", name: "John Doe", email: "john@example.com", password: "hashed_pwd_004", role: UserRole.CUSTOMER, isActive: true, branchId: null },
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
        emailVerified: user.role !== "CUSTOMER" ? new Date() : null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: user.isActive,
        branchId: user.branchId,
        emailVerified: user.role !== "CUSTOMER" ? new Date() : null,
      },
    });
  }
  console.log("✅ Users seeded.");

  // 3. Create Categories
  const categories = [
    { id: "cat_003", name: "Orthopedic Mattresses", slug: "orthopedic-mattresses" },
    { id: "cat_001", name: "Luxury Mattresses", slug: "luxury-mattresses" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Categories seeded.");

  // The images array the user provided to be reused
  const baseImagesData = [
    { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780742134/products/npzslxwk9dht30nwjda3.jpg", publicId: "products/npzslxwk9dht30nwjda3", sortOrder: 0 },
    { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780742134/products/ln5qova72n8u7qjnepwo.avif", publicId: "products/ln5qova72n8u7qjnepwo", sortOrder: 1 },
    { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780742134/products/nyo5xbyvithkwcw01vcp.avif", publicId: "products/nyo5xbyvithkwcw01vcp", sortOrder: 2 },
    { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780742134/products/hanym23ezl0plcyhlrl6.webp", publicId: "products/hanym23ezl0plcyhlrl6", sortOrder: 3 },
    { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780742134/products/zhsikngyakozrc9z40cj.webp", publicId: "products/zhsikngyakozrc9z40cj", sortOrder: 4 }
  ];

  const NUM_PRODUCTS = 12;
  const createdProductIds = [];

  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const categoryId = faker.helpers.arrayElement(categories).id;
    const fakeProduct = generateFakeProduct(categoryId, baseImagesData);
    
    // Specifications
    const specificationsData = [
      { label: "Mattress Type", value: "Euro Top Orthopedic" },
      { label: "Comfort Level", value: faker.helpers.arrayElement(["Medium Firm", "Soft", "Firm"]) },
      { label: "Support Type", value: "Orthopedic Back Support" },
      { label: "Fabric", value: "Premium Knitted Fabric" },
      { label: "Warranty", value: "10 Years" },
      { label: "Durability", value: "15 Years" },
      { label: "Cooling Feature", value: "Airflow Technology" },
      { label: "Motion Isolation", value: "Yes" },
      { label: "Reversible", value: "No" },
      { label: "Country Of Origin", value: "India" }
    ];

    // Sections
    const sectionsData = [
      {
        type: "FEATURES_WITH_IMAGE",
        content: {
          image: {
            url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780743129/products/idig2pxco4uetv9igcmk.jpg",
            publicId: "products/idig2pxco4uetv9igcmk"
          },
          title: "Features",
          features: [
            { title: "Premium Euro Top Layer", description: faker.lorem.sentence() },
            { title: "Orthopedic Back Support", description: faker.lorem.sentence() },
            { title: "Pressure Relief Design", description: faker.lorem.sentence() },
            { title: "Motion Isolation Technology", description: faker.lorem.sentence() },
            { title: "Cooling Airflow Fabric", description: faker.lorem.sentence() },
          ],
          description: faker.lorem.paragraphs(2)
        },
        sortOrder: 1
      },
      {
        type: "IMAGE_COMPARISON",
        content: {
          items: [
            {
              image: { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780743148/products/vuzzuckglzrhjjastr1a.webp", publicId: "products/vuzzuckglzrhjjastr1a" },
              label: "1"
            },
            {
              image: { url: "https://res.cloudinary.com/dnvcjfgbl/image/upload/v1780743151/products/eitpywncauokutlqfupp.jpg", publicId: "products/eitpywncauokutlqfupp" },
              label: "2"
            }
          ],
          title: "Comparison"
        },
        sortOrder: 2
      },
      {
        type: "SLEEPER_GUIDE",
        content: {
          title: "Sleeper Guide",
          guides: [
            {
              title: "Back Sleepers",
              features: [
                { id: faker.string.numeric(10), text: "Orthopedic or memory foam layer to contour the spine" },
                { id: faker.string.numeric(10), text: "Even weight distribution to reduce pressure points" }
              ],
              mattressType: "Medium-firm to firm",
              supportNeeded: "Proper spinal alignment and lower back support"
            }
          ]
        },
        sortOrder: 3
      }
    ];

    // FAQs
    const faqsData = [
      { question: "Is this mattress suitable for back pain?", answer: "Yes. Orthopedic support layers help maintain spinal alignment.", sortOrder: 0 },
      { question: "Can couples use this mattress?", answer: "Yes. Motion isolation technology minimizes movement transfer.", sortOrder: 1 },
      { question: "What warranty is included?", answer: "10 years manufacturer warranty.", sortOrder: 2 }
    ];

    // Variants (generating a few variants for each product based on its basePrice)
    const sizes = [
      { sizeName: "SINGLE", w: 36, l: [72, 75, 78] },
      { sizeName: "DOUBLE", w: 48, l: [72, 75, 78] },
      { sizeName: "QUEEN", w: 60, l: [72, 75, 78] },
      { sizeName: "KING", w: 72, l: [72, 75, 78] }
    ];
    
    const thicknesses = [4, 6, 8, 10];
    const variantsData = [];
    
    let isDefaultAssigned = false;
    for (const size of sizes) {
      for (const length of size.l) {
        for (const thickness of thicknesses) {
           // Skip some combinations to make it realistic
           if (faker.datatype.boolean(0.7)) continue; 

           const multiplier = (size.w / 36) * (thickness / 4);
           const mrp = Math.round(fakeProduct.basePrice * multiplier / 100) * 100;
           const salePrice = Math.round(mrp * 0.9 / 100) * 100;

           variantsData.push({
             id: faker.string.uuid(),
             mrp,
             salePrice,
             isDefault: !isDefaultAssigned,
             mattressVariant: {
               id: faker.string.uuid(),
               sizeName: size.sizeName,
               width: size.w,
               length: length,
               thickness: thickness
             }
           });
           isDefaultAssigned = true;
        }
      }
    }
    
    // Ensure at least one default variant exists if all were skipped
    if (variantsData.length === 0) {
      const mrp = fakeProduct.basePrice;
      variantsData.push({
         id: faker.string.uuid(),
         mrp,
         salePrice: Math.round(mrp * 0.9),
         isDefault: true,
         mattressVariant: {
           id: faker.string.uuid(),
           sizeName: "SINGLE",
           width: 36,
           length: 72,
           thickness: 4
         }
       });
    }

    await prisma.product.create({
      data: {
        id: fakeProduct.id,
        name: fakeProduct.name,
        slug: fakeProduct.slug,
        type: fakeProduct.type,
        shortDescription: fakeProduct.shortDescription,
        categoryId: fakeProduct.categoryId,
        thumbnailUrl: fakeProduct.thumbnailUrl,
        thumbnailPublicId: fakeProduct.thumbnailPublicId,
        isFeatured: fakeProduct.isFeatured,
        isActive: fakeProduct.isActive,
        allowCustomSize: fakeProduct.allowCustomSize,
        minWidth: fakeProduct.minWidth,
        maxWidth: fakeProduct.maxWidth,
        minLength: fakeProduct.minLength,
        maxLength: fakeProduct.maxLength,
        customSizePricing: fakeProduct.customSizePricing,
        sectionHeading: fakeProduct.sectionHeading,
        firmness: fakeProduct.firmness,
        comfortLevel: fakeProduct.comfortLevel,
        healthBenefits: fakeProduct.healthBenefits,
        recommendedAgeGroups: fakeProduct.recommendedAgeGroups,
        recommendedWeightGroups: fakeProduct.recommendedWeightGroups,
        recommendedPositions: fakeProduct.recommendedPositions,
        
        images: {
          create: baseImagesData.map(img => ({ id: faker.string.uuid(), ...img }))
        },
        specifications: {
          create: specificationsData.map(spec => ({ id: faker.string.uuid(), ...spec }))
        },
        sections: {
          create: sectionsData.map(s => ({ id: faker.string.uuid(), ...s, content: s.content as any }))
        },
        faqs: {
          create: faqsData.map(faq => ({ id: faker.string.uuid(), ...faq }))
        },
        variants: {
          create: variantsData.map(v => ({
              id: v.id,
              mrp: v.mrp,
              salePrice: v.salePrice,
              isDefault: v.isDefault,
              mattressVariant: {
                  create: {
                      id: v.mattressVariant.id,
                      sizeName: v.mattressVariant.sizeName as MattressSize,
                      width: v.mattressVariant.width,
                      length: v.mattressVariant.length,
                      thickness: v.mattressVariant.thickness
                  }
              }
          }))
        }
      }
    });

    createdProductIds.push(fakeProduct.id);
    console.log(`Created product ${i + 1}/${NUM_PRODUCTS}: ${fakeProduct.name}`);
  }

  // 5. Create a sample order
  if (createdProductIds.length > 0) {
    const firstProduct = await prisma.product.findUnique({
      where: { id: createdProductIds[0] },
      include: { variants: { include: { mattressVariant: true } } }
    });
    
    const customer = await prisma.user.findUnique({
      where: { email: "john@example.com" }
    });

    if (firstProduct && firstProduct.variants.length > 0 && customer) {
      await prisma.order.upsert({
        where: { orderNumber: "ORD-1001" },
        update: { branchId: "branch_001" },
        create: {
          orderNumber: "ORD-1001",
          customerId: customer.id,
          status: OrderStatus.PENDING_PAYMENT,
          subTotal: Number(firstProduct.variants[0].salePrice),
          discountTotal: 0,
          shippingTotal: 0,
          totalAmount: Number(firstProduct.variants[0].salePrice),
          branchId: "branch_001",
          shippingAddress: { fullName: "John Doe", phone: "212-555-0101", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "US" },
          notes: "Leave at front door",
          items: {
            create: [
              {
                productId: firstProduct.id,
                variantId: firstProduct.variants[0].id,
                quantity: 1,
                productName: firstProduct.name,
                variantData: { 
                  size: firstProduct.variants[0].mattressVariant?.sizeName, 
                  thickness: firstProduct.variants[0].mattressVariant?.thickness 
                },
                price: firstProduct.variants[0].salePrice
              }
            ]
          }
        }
      });
      console.log("✅ Sample order seeded.");
    }
  }

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