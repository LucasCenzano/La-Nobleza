import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const producto = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!producto) return NextResponse.json({ message: 'No encontrado' }, { status: 404 });
  return NextResponse.json(producto);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const {
      nombre, descripcion, precio, precioOferta,
      categoria, tipoVenta, stock, incrementoPeso, imagenUrl, imagenesUrls,
      etiquetas, activo,
    } = await req.json();

    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: {
        nombre,
        descripcion:  descripcion  || null,
        precio:       Number(precio),
        precioOferta: precioOferta ? Number(precioOferta) : null,
        categoria,
        tipoVenta,
        stock:        stock !== undefined && stock !== null ? Number(stock) : null,
        incrementoPeso: incrementoPeso !== undefined && incrementoPeso !== null ? Number(incrementoPeso) : null,
        imagenUrl:    imagenUrl    || null,
        imagenesUrls: imagenesUrls ?? [],
        etiquetas:    etiquetas    ?? [],
        activo:       Boolean(activo),
      },
    });

    return NextResponse.json(producto);
  } catch (err) {
    console.error('[PUT /api/admin/productos/[id]]', err);
    return NextResponse.json({ message: 'Error al actualizar.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(producto);
  } catch (err) {
    console.error('[PATCH /api/admin/productos/[id]]', err);
    return NextResponse.json({ message: 'Error al actualizar.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    await prisma.producto.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/productos/[id]]', err);
    return NextResponse.json({ message: 'Error al eliminar.' }, { status: 500 });
  }
}
