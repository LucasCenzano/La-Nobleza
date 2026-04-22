import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

// Public endpoint — no auth required
// Returns active categories ordered for the catalog filter pills
export async function GET() {
  try {
    const categorias = await prisma.categoriaConfig.findMany({
      where:   { activo: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select:  { id: true, nombre: true, slug: true, emoji: true, color: true, orden: true, activo: true },
    });
    return NextResponse.json(categorias);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
