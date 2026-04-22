const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT id, 
           CASE WHEN "imagenUrl" IS NOT NULL THEN 1 ELSE 0 END as "hasImage",
           cardinality("imagenesUrls") as "imagesCount",
           (SELECT array_agg(substring(img from '#framing:.*')) FROM unnest("imagenesUrls") as img) as framings
    FROM productos
    LIMIT 2
  `;
  console.log(result);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
