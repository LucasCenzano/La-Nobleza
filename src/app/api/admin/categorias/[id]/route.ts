import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params { params: { id: string } }

// PUT /api/admin/categorias/[id] — full update
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const { nombre, emoji, color, activo } = await req.json();
    // Note: slug is immutable after creation (products reference it)

    const categoria = await prisma.categoriaConfig.update({
      where: { id: params.id },
      data: {
        nombre,
        emoji:  emoji  ?? '📦',
        color:  color  ?? '#6b7280',
        activo: activo ?? true,
      },
    });

    return NextResponse.json(categoria);
  } catch (err) {
    console.error('[PUT /api/admin/categorias/[id]]', err);
    return NextResponse.json({ message: 'Error al actualizar.' }, { status: 500 });
  }
}

// DELETE /api/admin/categorias/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    // Check if any products use this category
    const cat = await prisma.categoriaConfig.findUnique({ where: { id: params.id } });
    if (!cat) return NextResponse.json({ message: 'No encontrada.' }, { status: 404 });

    const inUse = await prisma.producto.count({ where: { categoria: cat.slug } });
    if (inUse > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar: ${inUse} producto(s) usan esta categoría.` },
        { status: 409 },
      );
    }

    await prisma.categoriaConfig.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/categorias/[id]]', err);
    return NextResponse.json({ message: 'Error al eliminar.' }, { status: 500 });
  }
}
