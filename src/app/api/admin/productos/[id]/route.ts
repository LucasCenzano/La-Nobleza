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
      categoria, tipoVenta, pesoEstimado, stock, incrementoPeso, imagenUrl, imagenesUrls, imagenesFraming,
      etiquetas, activo, solicitaInstrucciones, opcionesTitulo, opcionesValores,
      promoPersonalizada, promoCantidadRequerida, promoPrecioTotal,
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
        pesoEstimado: pesoEstimado !== undefined && pesoEstimado !== null ? Math.round(Number(pesoEstimado) * 100) / 100 : null,
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

    // ── SEGURIDAD: Whitelist de campos permitidos via PATCH ────────────────
    // Solo se permiten activo y orden — los únicos campos que el frontend
    // actualiza por esta vía (toggle rápido y reordenamiento).
    // Tipado explícito para compatibilidad con Prisma.
    const safeData: { activo?: boolean; orden?: number } = {};

    if ('activo' in body && typeof body.activo === 'boolean') {
      safeData.activo = body.activo;
    }
    if ('orden' in body && typeof body.orden === 'number') {
      safeData.orden = body.orden;
    }

    if (Object.keys(safeData).length === 0) {
      return NextResponse.json({ message: 'No hay campos válidos para actualizar.' }, { status: 400 });
    }

    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: safeData,
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
    // Soft Delete: en lugar de borrar la fila, marcamos eliminado como true
    await prisma.producto.update({ 
      where: { id: params.id },
      data: { eliminado: true }
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/productos/[id]]', err);
    return NextResponse.json({ message: 'Error al eliminar.' }, { status: 500 });
  }
}
