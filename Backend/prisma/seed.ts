import { PrismaClient, ProductCategory, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Users
  const users = [
    {
      id: '11111111-1111-1111-1111-111111111111', // Hardcoded UUID for Basic user
      email: 'basic@email.com',
      password: 'basic',
      role: Role.BASIC,
    },
    {
      id: '22222222-2222-2222-2222-222222222222', // Hardcoded UUID for Verified user
      email: 'verified@email.com',
      password: 'verified',
      role: Role.VERIFIED,
    },
    {
      id: '33333333-3333-3333-3333-333333333333', // Hardcoded UUID for Merchant user
      email: 'merchant@email.com',
      password: 'merchant',
      role: Role.MERCHANT,
    },
    {
      id: '44444444-4444-4444-4444-444444444444', // Hardcoded UUID for Admin user
      email: 'admin@email.com',
      password: 'admin',
      role: Role.ADMIN,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  // Products
  const products = [
    {
      id: '55555555-5555-5555-5555-555555555555', // Tomatoes
      name: 'Tomatoes',
      description: 'Fresh tomatoes',
      category: ProductCategory.PRODUCE,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: '66666666-6666-6666-6666-666666666666', // Chicken Breasts
      name: 'Chicken Breasts',
      description: 'Boneless chicken breasts',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: '77777777-7777-7777-7777-777777777777', // Beef Tenderloin
      name: 'Beef Tenderloin',
      description: 'Premium beef tenderloin',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: '88888888-8888-8888-8888-888888888888', // Flour
      name: 'Flour',
      description: 'All-purpose flour',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
      id: '99999999-9999-9999-9999-999999999999', // White Granulated Sugar
      name: 'White Granulated Sugar',
      description: 'Fine white sugar',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Corn Oil
      name: 'Corn Oil',
      description: 'Refined corn oil',
      category: ProductCategory.GROCERY,
      units: ['liter'],
      isTypicallyBranded: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  // Brands
  const brands = [
    {
      id: '00000000-0000-0000-0000-UNBRANDED00', // Placeholder UUID for unbranded
      name: 'Unbranded',
      logo: null,
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // Nestle
      name: 'Nestle',
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Mavesa
      name: 'Mavesa',
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', // Heinz
      name: 'Heinz',
    },
  ];

  for (const brand of brands) {
    await prisma.brand.create({
      data: brand,
    });
  }

  // Franchises
  const franchises = [
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', // Mas por Menos
      name: 'Mas por Menos',
      logo: 'https://example.com/maspormenos-logo.png',
    },
    {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', // Aikoz
      name: 'Aikoz',
      logo: 'https://example.com/aikoz-logo.png',
    },
  ];

  for (const franchise of franchises) {
    await prisma.franchise.create({
      data: franchise,
    });
  }

  // BrandProducts
  const brandProducts = [
    // Branded products
    {
      id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      brandId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // Nestle
      productId: '88888888-8888-8888-8888-888888888888', // Flour
    },
    {
      id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      brandId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Mavesa
      productId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Corn Oil
    },
    {
      id: '33333333-cccc-cccc-cccc-cccccccccccc',
      brandId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', // Heinz
      productId: '99999999-9999-9999-9999-999999999999', // White Granulated Sugar
    },

    // Unbranded products
    {
      id: '44444444-dddd-dddd-dddd-dddddddddddd',
      brandId: '00000000-0000-0000-0000-UNBRANDED00', // Unbranded
      productId: '55555555-5555-5555-5555-555555555555', // Tomatoes
    },
    {
      id: '55555555-eeee-eeee-eeee-eeeeeeeeeeee',
      brandId: '00000000-0000-0000-0000-UNBRANDED00', // Unbranded
      productId: '66666666-6666-6666-6666-666666666666', // Chicken Breasts
    },
    {
      id: '66666666-ffff-ffff-ffff-ffffffffffff',
      brandId: '00000000-0000-0000-0000-UNBRANDED00', // Unbranded
      productId: '77777777-7777-7777-7777-777777777777', // Beef Tenderloin
    },
  ];

  for (const brandProduct of brandProducts) {
    await prisma.brandProduct.create({
      data: brandProduct,
    });
  }

  console.log('🌱🌱🌱 Database has been seeded. 🌱🌱🌱');
  console.log('🌱🌱🌱 Database has been seeded. 🌱🌱🌱');
  console.log('🌱🌱🌱 Database has been seeded. 🌱🌱🌱');
  console.log('🌱🌱🌱 Database has been seeded. 🌱🌱🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
