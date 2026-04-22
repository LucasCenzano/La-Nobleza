import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Validar productos básicos
    const productosValidos = productos.map((p: any) => ({
      nombre: p.nombre,
      descripcion: p.descripcion || null,
      precio: Number(p.precio) || 0,
      categoria: p.categoria || 'OTROS',
      tipoVenta: p.tipoVenta === 'PESO' ? 'PESO' : 'UNIDAD',
      stock: p.stock !== undefined && p.stock !== null && p.stock !== '' ? Number(p.stock) : null,
      incrementoPeso: p.incrementoPeso ? Number(p.incrementoPeso) : null,
      activo: p.activo !== undefined ? Boolean(p.activo) : true,
      orden: p.orden !== undefined ? Number(p.orden) : 0,
      imagenesUrls: [],
      etiquetas: p.etiquetas ? p.etiquetas.split(',').map((e: string) => e.trim()).filter(Boolean) : [],
    }));

    // Insertar todos en la base de datos
    const result = await prisma.producto.createMany({
      data: productosValidos,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Se importaron ${result.count} productos correctamente.`,
      count: result.count 
    });

  } catch (error) {
    console.error('Error importing bulk products:', error);
    return NextResponse.json({ error: 'Error al importar los productos' }, { status: 500 });
  }
}
