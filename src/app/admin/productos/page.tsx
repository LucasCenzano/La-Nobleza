import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/AdminNav';
import ProductManagerClient from '@/components/admin/ProductManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const PRODUCT_SELECT = {
    id: true, nombre: true, descripcion: true, precio: true, precioOferta: true,
    categoria: true, tipoVenta: true, stock: true, incrementoPeso: true,
    etiquetas: true, solicitaInstrucciones: true, opcionesTitulo: true,
    opcionesValores: true, promoPersonalizada: true, promoCantidadRequerida: true,
    promoPrecioTotal: true, activo: true, orden: true, createdAt: true, updatedAt: true,
    imagenUrl: true, imagenesUrls: true, imagenesFraming: true
  };

  const [productos, categorias] = await Promise.all([
    prisma.producto.findMany({
      where: { eliminado: false },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: PRODUCT_SELECT,
    }),
    prisma.categoriaConfig.findMany({ orderBy: [{ orden: 'asc' }] }),
  ]);

  return (
    <>
      <AdminNav />
      <ProductManagerClient 
        initialProductos={productos as any} 
        categorias={categorias} 
      />
    </>
  );
}
