import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const productos = await prisma.producto.findMany({
    orderBy: [{ activo: 'desc' }, { categoria: 'asc' }, { nombre: 'asc' }],
  });

  // Limpiar Base64 inmensos para que el Admin cargue instantáneamente
  const cleanProducts = productos.map(p => {
    const imagesCount = p.imagenesUrls?.length || (p.imagenUrl ? 1 : 0);
    const fakeUrls = Array.from({ length: imagesCount }).map((_, i) => `/api/images/${p.id}?idx=${i}`);
    
    return {
      ...p,
      imagenUrl: fakeUrls[0] || null,
      imagenesUrls: fakeUrls,
    };
  });

  return NextResponse.json(cleanProducts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      nombre, descripcion, precio, precioOferta,
      categoria, tipoVenta, stock, incrementoPeso, imagenUrl, imagenesUrls,
      etiquetas, activo,
      solicitaInstrucciones, opcionesTitulo, opcionesValores,
    } = body;

    if (!nombre || precio === undefined || !categoria || !tipoVenta) {
      return NextResponse.json({ message: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const producto = await prisma.producto.create({
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
        solicitaInstrucciones: Boolean(solicitaInstrucciones),
        opcionesTitulo: opcionesTitulo || null,
        opcionesValores: opcionesValores ?? [],
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/productos]', err);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
