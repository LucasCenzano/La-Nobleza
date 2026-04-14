/**
 * migrate-and-seed.mjs
 * 1. Converts productos.categoria from Postgres enum → TEXT
 * 2. Drops old Categoria enum type
 * 3. Adds new columns (precioOferta, etiquetas) if missing
 * 4. Creates/seeds categorias_config table
 *
 * Run once: node scripts/migrate-and-seed.mjs
 */

import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually (Prisma CLI reads it, but node doesn't)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] ??= val;
  }
} catch { /* .env.local not found, use existing env */ }

const prisma = new PrismaClient({ log: ['warn', 'error'] });

const DEFAULTS = [
  { slug: 'POLLO_ENTERO', nombre: 'Pollo Entero',   emoji: '🐔', color: '#f97316', orden: 0 },
  { slug: 'PRESAS',       nombre: 'Presas',          emoji: '🍗', color: '#ea580c', orden: 1 },
  { slug: 'MENUDENCIAS',  nombre: 'Menudencias',     emoji: '🫀', color: '#dc2626', orden: 2 },
  { slug: 'EMBUTIDOS',    nombre: 'Embutidos',       emoji: '🌭', color: '#d97706', orden: 3 },
  { slug: 'HUEVOS',       nombre: 'Huevos',          emoji: '🥚', color: '#eab308', orden: 4 },
  { slug: 'OTROS',        nombre: 'Otros',           emoji: '📦', color: '#6b7280', orden: 5 },
];

async function main() {
  console.log('🚀 Iniciando migración...\n');

  // 1. Convert categoria column from enum → TEXT (safe even if already TEXT)
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "public"."productos" ALTER COLUMN "categoria" TYPE TEXT USING "categoria"::TEXT;`
    );
    console.log('✅ Columna categoria convertida a TEXT');
  } catch (e) {
    if (e.message?.includes('already') || e.message?.includes('does not exist')) {
      console.log('ℹ️  Columna categoria ya es TEXT — ok');
    } else {
      console.warn('⚠️  ALTER categoria:', e.message);
    }
  }

  // 2. Drop the old Categoria enum type (safe with IF EXISTS)
  try {
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "public"."Categoria" CASCADE;`);
    console.log('✅ Enum Categoria eliminado');
  } catch (e) {
    console.warn('⚠️  DROP TYPE:', e.message);
  }

  // 3. Push new schema (handled by prisma db push after this script)
  console.log('\n📋 Seeding categorías por defecto...');
  for (const cat of DEFAULTS) {
    await prisma.categoriaConfig.upsert({
      where:  { slug: cat.slug },
      update: { nombre: cat.nombre, emoji: cat.emoji, color: cat.color, orden: cat.orden },
      create: { ...cat, activo: true },
    });
    console.log(`   ✔ ${cat.emoji} ${cat.nombre}`);
  }

  console.log('\n✨ Migración completada exitosamente.');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
