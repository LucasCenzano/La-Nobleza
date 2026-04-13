/**
 * Seed script: crea el administrador inicial y productos de ejemplo.
 * Uso: npx tsx prisma/seed.ts
 *      (o: npm run db:seed después de configurar package.json)
 */
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin ──────────────────────────────────────────────────────
  const email    = process.env.ADMIN_EMAIL    ?? 'admin@lanobleza.com';
  const password = process.env.ADMIN_PASSWORD ?? 'CambiarEstaContraseña123!';
  const hashed   = await hash(password, 12);

  await prisma.administrador.upsert({
    where:  { email },
    update: {},
    create: { email, password: hashed, nombre: 'Administrador' },
  });
  console.log(`✅ Admin creado: ${email}`);

  // ── Productos de ejemplo ───────────────────────────────────────
  const productos = [
    {
      nombre:      'Pollo Entero',
      descripcion: 'Pollo entero fresco, listo para cocinar.',
      precio:      3500,
      categoria:   'POLLO_ENTERO' as const,
      tipoVenta:   'PESO' as const,
      imagenUrl:   null,
      activo:      true,
    },
    {
      nombre:      'Pechuga sin hueso',
      descripcion: 'Pechuga de pollo deshuesada y limpia.',
      precio:      5200,
      categoria:   'PRESAS' as const,
      tipoVenta:   'PESO' as const,
      imagenUrl:   null,
      activo:      true,
    },
    {
      nombre:      'Muslo y contramuslo',
      descripcion: 'Porción jugosa, ideal para asado.',
      precio:      4100,
      categoria:   'PRESAS' as const,
      tipoVenta:   'PESO' as const,
      imagenUrl:   null,
      activo:      true,
    },
    {
      nombre:      'Huevos de campo (docena)',
      descripcion: 'Docena de huevos frescos de campo.',
      precio:      1800,
      categoria:   'HUEVOS' as const,
      tipoVenta:   'UNIDAD' as const,
      imagenUrl:   null,
      activo:      true,
    },
    {
      nombre:      'Menudos surtidos',
      descripcion: 'Molleja, hígado y corazón, especial para parrilla.',
      precio:      2200,
      categoria:   'MENUDENCIAS' as const,
      tipoVenta:   'PESO' as const,
      imagenUrl:   null,
      activo:      true,
    },
  ];

  for (const p of productos) {
    await prisma.producto.upsert({
      where:  { id: '00000000-0000-0000-0000-' + p.nombre.replace(/\s/g, '').padStart(12, '0') },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${productos.length} productos de ejemplo creados.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
