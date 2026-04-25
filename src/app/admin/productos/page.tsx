import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import ProductTable from '@/components/admin/ProductTable';
import ProductFilters from '@/components/admin/ProductFilters';
import ProductImportWrapper from '@/components/admin/ProductImportWrapper';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    q?:         string;
    estado?:    string;
    categoria?: string;
    etiqueta?:  string;
    sort?:      string;
  };
}

function buildOrderBy(sort?: string) {
  switch (sort) {
    case 'nombre_asc':  return [{ nombre: 'asc'  as const }];
    case 'nombre_desc': return [{ nombre: 'desc' as const }];
    case 'precio_asc':  return [{ precio: 'asc'  as const }];
    case 'precio_desc': return [{ precio: 'desc' as const }];
    case 'fecha_asc':   return [{ updatedAt: 'asc'  as const }];
    case 'fecha_desc':  return [{ updatedAt: 'desc' as const }];
    default:            return [{ activo: 'desc' as const }, { categoria: 'asc' as const }, { nombre: 'asc' as const }];
  }
}

function buildTitle(estado?: string, categoria?: string, etiqueta?: string): string {
  if (estado === 'activos')   return 'Productos Activos';
  if (estado === 'pausados')  return 'Productos Pausados';
  if (estado === 'sin_foto')  return 'Productos Sin Foto';
  if (estado === 'en_oferta') return 'Productos en Oferta';
  if (categoria)              return `Categoría: ${categoria}`;
  if (etiqueta)               return `Etiqueta: ${etiqueta}`;
  return 'Gestión de Productos';
}

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

// ─── Simple Client Manager ──────────────────────────────────────────
import ProductManagerClient from '@/components/admin/ProductManagerClient';
