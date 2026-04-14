import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint — no auth required
// Returns active categories ordered for the catalog filter pills
export async function GET() {
  try {
    const categorias = await prisma.categoriaConfig.findMany({
      where:   { activo: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select:  { id: true, nombre: true, slug: true, emoji: true, color: true, orden: true, activo: true },
    });
    return NextResponse.json(categorias, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
