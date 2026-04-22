import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.administrador.findMany();
  console.log('Admins in DB:', admins);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
