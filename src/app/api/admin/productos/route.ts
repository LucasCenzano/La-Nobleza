import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/productos
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const productos = await prisma.producto.findMany({
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  });
  return NextResponse.json(productos);
}

// POST /api/admin/productos
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const { nombre, descripcion, precio, categoria, tipoVenta, imagenUrl, activo } = body;

    if (!nombre || precio === undefined || !categoria || !tipoVenta) {
      return NextResponse.json(
        { message: 'Faltan campos obligatorios.' },
        { status: 400 },
      );
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
        categoria,
        tipoVenta,
        imagenUrl: imagenUrl || null,
        activo: Boolean(activo),
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/productos]', err);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
