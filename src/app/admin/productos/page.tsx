import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import ProductTable from '@/components/admin/ProductTable';
import ProductFilters from '@/components/admin/ProductFilters';
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

export default async function AdminProductosPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { q, estado, categoria, etiqueta, sort } = searchParams;

  // ─── Build Prisma WHERE ────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (q)         where.nombre    = { contains: q, mode: 'insensitive' };
  if (categoria) where.categoria = categoria;
  if (etiqueta)  where.etiquetas = { has: etiqueta };

  if (estado === 'activos')   where.activo = true;
  if (estado === 'pausados')  where.activo = false;
  if (estado === 'en_oferta') where.precioOferta = { not: null };
  // 'sin_foto' is handled post-fetch (array filter)

  const PRODUCT_SELECT = {
    id: true, nombre: true, descripcion: true, precio: true, precioOferta: true,
    categoria: true, tipoVenta: true, stock: true, incrementoPeso: true,
    etiquetas: true, solicitaInstrucciones: true, opcionesTitulo: true,
    opcionesValores: true, promoPersonalizada: true, promoCantidadRequerida: true,
    promoPrecioTotal: true, activo: true, orden: true, createdAt: true, updatedAt: true,
    imagenUrl: true, imagenesUrls: true
  };

  const [todosProductosData, categorias] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy: buildOrderBy(sort),
      select: PRODUCT_SELECT,
    }),
    prisma.categoriaConfig.findMany({ orderBy: [{ orden: 'asc' }] }),
  ]);

  const todosProductos = todosProductosData;

  // Post-fetch filter for sin_foto
  const productos = estado === 'sin_foto'
    ? todosProductos.filter((p) => !p.imagenUrl && (!p.imagenesUrls?.length))
    : todosProductos;

  // Global counts (using select to avoid payload size)
  const allProductosData = await prisma.producto.findMany({ select: { id: true, activo: true, precioOferta: true, imagenUrl: true, imagenesUrls: true } });
  const totalAll  = allProductosData.length;
  const activos   = allProductosData.filter((p) => p.activo).length;
  const pausados  = allProductosData.filter((p) => !p.activo).length;
  const sinFoto   = allProductosData.filter((p) => !p.imagenUrl && (!p.imagenesUrls?.length)).length;
  const enOferta  = allProductosData.filter((p) => !!(p as any).precioOferta).length;

  const isFiltered = !!(q || estado || categoria || etiqueta);
  const pageTitle  = buildTitle(estado, categoria, etiqueta);

  return (
    <>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{pageTitle}</h1>
            {isFiltered && (
              <p className="text-sm text-gray-500 mt-0.5">
                Mostrando {productos.length} de {totalAll} productos
              </p>
            )}
          </div>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            ➕ Nuevo Producto
          </Link>
        </div>

        {/* ── Mini stat chips (always visible) ────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {[
            { label: 'Total',     value: totalAll, href: '/admin/productos',                 color: 'bg-gray-100 text-gray-700',   active: !isFiltered && !estado },
            { label: 'Activos',   value: activos,  href: '/admin/productos?estado=activos',  color: 'bg-green-100 text-green-700', active: estado === 'activos'  },
            { label: 'Pausados',  value: pausados, href: '/admin/productos?estado=pausados', color: 'bg-amber-100 text-amber-700', active: estado === 'pausados' },
            { label: 'Sin foto',  value: sinFoto,  href: '/admin/productos?estado=sin_foto', color: 'bg-blue-100 text-blue-700',   active: estado === 'sin_foto' },
            { label: 'En oferta', value: enOferta, href: '/admin/productos?estado=en_oferta',color: 'bg-red-100 text-red-700',     active: estado === 'en_oferta'},
          ].map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={`${chip.color} rounded-xl px-3 py-2 text-center transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                chip.active ? 'ring-2 ring-offset-1 ring-current shadow-sm' : ''
              }`}
            >
              <p className="text-xl font-bold tabular-nums">{chip.value}</p>
              <p className="text-[10px] font-semibold opacity-80">{chip.label}</p>
            </Link>
          ))}
        </div>

        {/* ── Filters bar ─────────────────────────────────────── */}
        <Suspense fallback={<div className="h-28 rounded-2xl bg-gray-50 animate-pulse mb-6" />}>
          <ProductFilters categorias={categorias} totalCount={productos.length} />
        </Suspense>

        {/* ── Table ───────────────────────────────────────────── */}
        <ProductTable productos={productos as any} categorias={categorias} />
      </main>
    </>
  );
}
