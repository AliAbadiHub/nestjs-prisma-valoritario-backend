import { PrismaClient, Role } from '@prisma/client';
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
