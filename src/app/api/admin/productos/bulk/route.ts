import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { TipoVenta } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productos } = await req.json();

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 });
    }

    // Validar y procesar productos
    let actualizados = 0;
    let creados = 0;

    const operaciones = productos.map((p: any) => {
      const data = {
        nombre: p.nombre,
        descripcion: p.descripcion || null,
        precio: Number(p.precio) || 0,
        categoria: p.categoria || 'OTROS',
        tipoVenta: p.tipoVenta === 'PESO' ? TipoVenta.PESO : TipoVenta.UNIDAD,
        pesoEstimado: p.pesoEstimado !== undefined && p.pesoEstimado !== null && p.pesoEstimado !== '' ? Number(p.pesoEstimado) : null,
        stock: p.stock !== undefined && p.stock !== null && p.stock !== '' ? Number(p.stock) : null,
        activo: p.activo !== undefined ? Boolean(p.activo) : true,
      };

      if (p.id) {
        actualizados++;
        return prisma.producto.update({
          where: { id: p.id },
          data,
        });
      } else {
        creados++;
        return prisma.producto.create({
          data: {
            ...data,
            imagenesUrls: [],
            etiquetas: [],
            orden: 0,
          },
        });
      }
    });

    // Ejecutar todas las operaciones en una transacción
    await prisma.$transaction(operaciones);

    return NextResponse.json({ 
      success: true, 
      message: `Proceso completado: ${creados} nuevos, ${actualizados} actualizados.`,
      creados,
      actualizados
    });

  } catch (error) {
    console.error('Error importing bulk products:', error);
    return NextResponse.json({ error: 'Error al importar los productos' }, { status: 500 });
  }
}
