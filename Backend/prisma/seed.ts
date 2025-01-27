import { PrismaClient, ProductCategory, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

const prisma = new PrismaClient();

async function main() {
  // Users
  const users = [
    {
      id: uuidv4(), // Generated UUID for Basic user
      email: 'basic@email.com',
      password: 'basic',
      role: Role.BASIC,
    },
    {
      id: uuidv4(), // Generated UUID for Verified user
      email: 'verified@email.com',
      password: 'verified',
      role: Role.VERIFIED,
    },
    {
      id: uuidv4(), // Generated UUID for Merchant user
      email: 'merchant@email.com',
      password: 'merchant',
      role: Role.MERCHANT,
    },
    {
      id: uuidv4(), // Generated UUID for Admin user
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
      id: uuidv4(), // Generated UUID for Tomatoes
      name: 'Tomatoes',
      description: 'Fresh tomatoes',
      category: ProductCategory.PRODUCE,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: uuidv4(), // Generated UUID for Chicken Breasts
      name: 'Chicken Breasts',
      description: 'Boneless chicken breasts',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: uuidv4(), // Generated UUID for Beef Tenderloin
      name: 'Beef Tenderloin',
      description: 'Premium beef tenderloin',
      category: ProductCategory.BUTCHER,
      units: ['kg'],
      isTypicallyBranded: false,
    },
    {
      id: uuidv4(), // Generated UUID for Flour
      name: 'Flour',
      description: 'All-purpose flour',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
      id: uuidv4(), // Generated UUID for White Granulated Sugar
      name: 'White Granulated Sugar',
      description: 'Fine white sugar',
      category: ProductCategory.GROCERY,
      units: ['kg'],
      isTypicallyBranded: true,
    },
    {
      id: uuidv4(), // Generated UUID for Corn Oil
      name: 'Corn Oil',
      description: 'Refined corn oil',
      category: ProductCategory.GROCERY,
      units: ['liter', 'ml'],
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
      id: uuidv4(), // Generated UUID for Nestle
      name: 'Nestle',
      logo: 'https://example.com/nestle-logo.png',
    },
    {
      id: uuidv4(), // Generated UUID for Mavesa
      name: 'Mavesa',
      logo: 'https://example.com/mavesa-logo.png',
    },
    {
      id: uuidv4(), // Generated UUID for Heinz
      name: 'Heinz',
      logo: 'https://example.com/heinz-logo.png',
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
      id: uuidv4(), // Generated UUID for Mas por Menos
      name: 'Mas por Menos',
      logo: 'https://example.com/maspormenos-logo.png',
    },
    {
      id: uuidv4(), // Generated UUID for Aikoz
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
      id: uuidv4(),
      brandId: brands[1].id, // Nestle
      productId: products[3].id, // Flour
    },
    {
      id: uuidv4(),
      brandId: brands[2].id, // Mavesa
      productId: products[5].id, // Corn Oil
    },
    {
      id: uuidv4(),
      brandId: brands[3].id, // Heinz
      productId: products[4].id, // White Granulated Sugar
    },

    // Unbranded products
    {
      id: uuidv4(),
      brandId: brands[0].id, // Unbranded
      productId: products[0].id, // Tomatoes
    },
    {
      id: uuidv4(),
      brandId: brands[0].id, // Unbranded
      productId: products[1].id, // Chicken Breasts
    },
    {
      id: uuidv4(),
      brandId: brands[0].id, // Unbranded
      productId: products[2].id, // Beef Tenderloin
    },
  ];

  for (const brandProduct of brandProducts) {
    await prisma.brandProduct.create({
      data: brandProduct,
    });
  }

  // Supermarkets
  const supermarkets = [
    {
      id: uuidv4(), // Generated UUID for Mas por Menos
      name: 'Mas por Menos - Main Branch',
      city: 'Caracas',
      address: '123 Main Street, Caracas',
      latitude: 10.5,
      longitude: -66.9167,
      openingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '20:00' },
      },
    },
    {
      id: uuidv4(), // Generated UUID for Aikoz
      name: 'Aikoz - Downtown Branch',
      city: 'Maracaibo',
      address: '456 Downtown Avenue, Maracaibo',
      latitude: 10.6333,
      longitude: -71.6333,
      openingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '20:00' },
      },
    },
  ];

  for (const supermarket of supermarkets) {
    await prisma.supermarket.create({
      data: supermarket,
    });
  }

  // SupermarketProducts
  const supermarketProducts = [
    {
      id: uuidv4(),
      supermarketId: supermarkets[0].id, // Mas por Menos
      brandProductId: brandProducts[0].id, // Nestle Flour
      unit: '1 kg',
      price: 5.99,
      inStock: true,
    },
    {
      id: uuidv4(),
      supermarketId: supermarkets[0].id, // Mas por Menos
      brandProductId: brandProducts[1].id, // Mavesa Corn Oil
      unit: '500 ml',
      price: 2.99,
      inStock: true,
    },
    {
      id: uuidv4(),
      supermarketId: supermarkets[0].id, // Mas por Menos
      brandProductId: brandProducts[1].id, // Mavesa Corn Oil
      unit: '1 liter',
      price: 5.99,
      inStock: true,
    },
    {
      id: uuidv4(),
      supermarketId: supermarkets[1].id, // Aikoz
      brandProductId: brandProducts[2].id, // Heinz White Granulated Sugar
      unit: '1 kg',
      price: 2.99,
      inStock: true,
    },
    {
      id: uuidv4(),
      supermarketId: supermarkets[1].id, // Aikoz
      brandProductId: brandProducts[3].id, // Unbranded Tomatoes
      unit: '1 kg',
      price: 1.99,
      inStock: false, // Out of stock
    },
  ];

  for (const supermarketProduct of supermarketProducts) {
    await prisma.supermarketProduct.create({
      data: supermarketProduct,
    });
  }

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
