import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/categorias — list all (ordered)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const categorias = await prisma.categoriaConfig.findMany({
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  });
  return NextResponse.json(categorias);
}

// POST /api/admin/categorias — create new
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const { nombre, slug, emoji, color, orden, activo } = await req.json();

    if (!nombre || !slug) {
      return NextResponse.json({ message: 'Nombre y slug son obligatorios.' }, { status: 400 });
    }

    // Normalize slug: uppercase, underscores, alphanumeric only
    const slugNorm = slug
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');

    // Check uniqueness
    const existing = await prisma.categoriaConfig.findUnique({ where: { slug: slugNorm } });
    if (existing) {
      return NextResponse.json(
        { message: `Ya existe una categoría con el slug "${slugNorm}".` },
        { status: 409 },
      );
    }

    const maxOrden = await prisma.categoriaConfig.aggregate({ _max: { orden: true } });
    const nextOrden = orden ?? (maxOrden._max.orden ?? -1) + 1;

    const categoria = await prisma.categoriaConfig.create({
      data: {
        nombre,
        slug: slugNorm,
        emoji: emoji || '📦',
        color: color || '#6b7280',
        orden: nextOrden,
        activo: activo ?? true,
      },
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/categorias]', err);
    return NextResponse.json({ message: 'Error interno.' }, { status: 500 });
  }
}

// PATCH /api/admin/categorias — bulk reorder (array of { id, orden })
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const items: { id: string; orden: number }[] = await req.json();

    await prisma.$transaction(
      items.map(({ id, orden }) =>
        prisma.categoriaConfig.update({ where: { id }, data: { orden } }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/admin/categorias]', err);
    return NextResponse.json({ message: 'Error al reordenar.' }, { status: 500 });
  }
}
