import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { ids, action, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No se enviaron IDs' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'ACTIVATE':
        result = await prisma.producto.updateMany({
          where: { id: { in: ids } },
          data: { activo: true },
        });
        break;
      case 'PAUSE':
        result = await prisma.producto.updateMany({
          where: { id: { in: ids } },
          data: { activo: false },
        });
        break;
      case 'DELETE':
        result = await prisma.producto.updateMany({
          where: { id: { in: ids } },
          data: { eliminado: true },
        });
        break;
      case 'CHANGE_CATEGORY':
        if (!data?.categoria) {
          return NextResponse.json({ error: 'Categoría no especificada' }, { status: 400 });
        }
        result = await prisma.producto.updateMany({
          where: { id: { in: ids } },
          data: { categoria: data.categoria },
        });
        break;

      case 'ADJUST_PRICE':
        if (data?.percentage === undefined) {
          return NextResponse.json({ error: 'Porcentaje no especificado' }, { status: 400 });
        }
        const factor = 1 + (data.percentage / 100);
        
        // Necesitamos hacerlo uno por uno o con un loop porque el precio nuevo depende del anterior
        const productsToAdjust = await prisma.producto.findMany({
          where: { id: { in: ids } },
          select: { id: true, precio: true, precioOferta: true }
        });

        const adjustPromises = productsToAdjust.map(p => {
          const newData: any = { precio: Math.round(p.precio * factor) };
          if (p.precioOferta) newData.precioOferta = Math.round(p.precioOferta * factor);
          
          return prisma.producto.update({
            where: { id: p.id },
            data: newData
          });
        });

        await prisma.$transaction(adjustPromises);
        result = { count: ids.length };
        break;

      case 'TOGGLE_OFFER':
        const productsToToggle = await prisma.producto.findMany({
          where: { id: { in: ids } },
          select: { id: true, precio: true, precioOferta: true }
        });

        const togglePromises = productsToToggle.map(p => {
          const hasOffer = !!p.precioOferta && p.precioOferta > 0;
          return prisma.producto.update({
            where: { id: p.id },
            data: { 
              precioOferta: hasOffer ? null : Math.round(p.precio * 0.9) 
            }
          });
        });

        await prisma.$transaction(togglePromises);
        result = { count: ids.length };
        break;

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: 'Error al procesar la acción masiva' }, { status: 500 });
  }
}
