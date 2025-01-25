import { PrismaClient, ProductCategory, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'basic@email.com',
      password: 'basic',
      role: Role.BASIC,
    },
    {
      email: 'verified@email.com',
      password: 'verified',
      role: Role.VERIFIED,
    },
    {
      email: 'merchant@email.com',
      password: 'merchant',
      role: Role.MERCHANT,
    },
    {
      email: 'admin@email.com',
      password: 'admin',
      role: Role.ADMIN,
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  const products = [
    {
      name: 'Tomatoes',
      description: 'Fresh tomatoes',
      category: ProductCategory.PRODUCE,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      name: 'Chicken Breasts',
      description: 'Boneless chicken breasts',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      name: 'Beef Tenderloin',
      description: 'Premium beef tenderloin',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      name: 'Flour',
      description: 'All-purpose flour',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
      name: 'White Granulated Sugar',
      description: 'Fine white sugar',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
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

  const brands = [{ name: 'Nestle' }, { name: 'Mavesa' }, { name: 'Heinz' }];

  for (const brand of brands) {
    await prisma.brand.create({
      data: brand,
    });
  }

  const franchises = [
    { name: 'Mas por Menos', logo: 'https://example.com/maspormenos-logo.png' },
    { name: 'Aikoz', logo: 'https://example.com/aikoz-logo.png' },
  ];

  for (const franchise of franchises) {
    await prisma.franchise.create({
      data: franchise,
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
