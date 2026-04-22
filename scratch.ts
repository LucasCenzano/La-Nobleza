import { prisma } from './src/lib/prisma';

async function main() {
  const result = await prisma.$queryRaw`
    SELECT id, 
           CASE WHEN "imagenUrl" IS NOT NULL THEN 1 ELSE 0 END as "hasImage",
           cardinality("imagenesUrls") as "imagesCount"
    FROM productos
  `;
  console.log(result);
}
main().catch(console.error);
