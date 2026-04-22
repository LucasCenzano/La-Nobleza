const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.producto.updateMany({
    data: {
      imagenUrl: null,
      imagenesUrls: [],
    }
  });
  console.log('Images wiped:', res);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
