import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const PRODUCT_SELECT = {
    id: true, nombre: true, descripcion: true, precio: true, precioOferta: true,
    categoria: true, tipoVenta: true, stock: true, incrementoPeso: true,
    etiquetas: true, solicitaInstrucciones: true, opcionesTitulo: true,
    opcionesValores: true, promoPersonalizada: true, promoCantidadRequerida: true,
    promoPrecioTotal: true, activo: true, orden: true, createdAt: true, updatedAt: true,
    imagenUrl: true, imagenesUrls: true, imagenesFraming: true
  };

  const productosData = await prisma.producto.findMany({
    where: { eliminado: false },
    orderBy: [{ activo: 'desc' }, { categoria: 'asc' }, { nombre: 'asc' }],
    select: PRODUCT_SELECT,
  });

  return NextResponse.json(productosData);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      nombre, descripcion, precio, precioOferta,
      categoria, tipoVenta, stock, incrementoPeso, imagenUrl, imagenesUrls, imagenesFraming,
      etiquetas, activo,
      solicitaInstrucciones, opcionesTitulo, opcionesValores,
      promoPersonalizada,
      promoCantidadRequerida, promoPrecioTotal,
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
        imagenesFraming: imagenesFraming ?? null,
        etiquetas:    etiquetas    ?? [],
        activo:       Boolean(activo),
        solicitaInstrucciones: Boolean(solicitaInstrucciones),
        opcionesTitulo: opcionesTitulo || null,
        opcionesValores: opcionesValores ?? [],
        promoPersonalizada: promoPersonalizada || null,
        promoCantidadRequerida: promoCantidadRequerida ? Number(promoCantidadRequerida) : null,
        promoPrecioTotal: promoPrecioTotal ? Number(promoPrecioTotal) : null,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/productos]', err);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
