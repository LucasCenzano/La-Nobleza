import { Suspense } from 'react';
import { TipoVenta } from '@prisma/client';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ProductCard from '@/components/catalog/ProductCard';
import SearchFilters from '@/components/catalog/SearchFilters';
import { CatalogBanner, CatalogHorarios, getCatalogConfig } from '@/components/catalog/CatalogInfo';
import { CategoriaConfigType } from '@/lib/constants';

interface HomePageProps {
  searchParams: {
    q?:         string;
    categoria?: string;
  };
}

// Mock data for demo mode (no DB)
const MOCK_PRODUCTOS = [
  { id: '1', nombre: 'Pollo Entero',          descripcion: 'Pollo entero fresco, listo para cocinar.',       precio: 3500, precioOferta: null, categoria: 'POLLO_ENTERO', tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', nombre: 'Pechuga sin hueso',     descripcion: 'Pechuga deshuesada y limpia. Ideal para milanesas.', precio: 5200, precioOferta: 4500, categoria: 'PRESAS',       tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', nombre: 'Muslo y Contramuslo',   descripcion: 'Porción jugosa, ideal para el asado o al horno.', precio: 4100, precioOferta: null, categoria: 'PRESAS',       tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', nombre: 'Huevos de Campo',       descripcion: 'Docena de huevos frescos de campo.',              precio: 1800, precioOferta: null, categoria: 'HUEVOS',       tipoVenta: 'UNIDAD' as TipoVenta, imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', nombre: 'Menudos Surtidos',      descripcion: 'Molleja, hígado y corazón. Especial para parrilla.', precio: 2200, precioOferta: null, categoria: 'MENUDENCIAS', tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', nombre: 'Alitas de Pollo',       descripcion: 'Alitas frescas, perfectas para el horno o fritas.',precio: 3200, precioOferta: null, categoria: 'PRESAS',       tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '7', nombre: 'Salchicha Parrillera',  descripcion: 'Salchicha artesanal de pollo para asado.',        precio: 2800, precioOferta: 2200, categoria: 'EMBUTIDOS',    tipoVenta: 'PESO' as TipoVenta,   imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA', 'DESTACADO'], activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '8', nombre: 'Carcasa de Pollo',      descripcion: 'Ideal para caldos y sopas caseras.',              precio: 800,  precioOferta: null, categoria: 'OTROS',        tipoVenta: 'UNIDAD' as TipoVenta, imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true, createdAt: new Date(), updatedAt: new Date() },
];

const MOCK_CATEGORIAS: CategoriaConfigType[] = [
  { id: '1', slug: 'POLLO_ENTERO', nombre: 'Pollo Entero', emoji: '🐔', color: '#f97316', orden: 0, activo: true },
  { id: '2', slug: 'PRESAS',       nombre: 'Presas',       emoji: '🍗', color: '#ea580c', orden: 1, activo: true },
  { id: '3', slug: 'MENUDENCIAS',  nombre: 'Menudencias',  emoji: '🫀', color: '#dc2626', orden: 2, activo: true },
  { id: '4', slug: 'EMBUTIDOS',    nombre: 'Embutidos',    emoji: '🌭', color: '#d97706', orden: 3, activo: true },
  { id: '5', slug: 'HUEVOS',       nombre: 'Huevos',       emoji: '🥚', color: '#eab308', orden: 4, activo: true },
  { id: '6', slug: 'OTROS',        nombre: 'Otros',        emoji: '📦', color: '#6b7280', orden: 5, activo: true },
];

async function getData(q?: string, categoria?: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const [productos, categorias] = await Promise.all([
      prisma.producto.findMany({
        where: {
          activo: true,
          ...(categoria ? { categoria } : {}),
          ...(q ? { nombre: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.categoriaConfig.findMany({
        where:   { activo: true },
        orderBy: [{ orden: 'asc' }],
      }),
    ]);
    return { productos, categorias, demo: false };
  } catch {
    const productos = MOCK_PRODUCTOS.filter((p) => {
      const matchQ   = !q        || p.nombre.toLowerCase().includes(q.toLowerCase());
      const matchCat = !categoria || p.categoria === categoria;
      return matchQ && matchCat;
    });
    return { productos, categorias: MOCK_CATEGORIAS, demo: true };
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [{ productos, categorias, demo }, catalogConfig] = await Promise.all([
    getData(searchParams.q, searchParams.categoria),
    getCatalogConfig(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <CatalogHeader />

      {/* Horarios de atención */}
      <CatalogHorarios config={catalogConfig} />

      {/* Banner del día */}
      <CatalogBanner config={catalogConfig} />

      {demo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium">
          ⚡ Modo demo — conectá tu base de datos Neon en{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>{' '}
          para ver datos reales
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-10">
        {/* Search + Filters */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-20 animate-pulse bg-cream-200 rounded-2xl" />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {productos.length === 0
            ? 'No se encontraron productos.'
            : `${productos.length} producto${productos.length !== 1 ? 's' : ''} disponible${productos.length !== 1 ? 's' : ''}`}
        </p>

        {/* Product Grid */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p as any} categorias={categorias} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <span className="text-5xl block mb-3">🔍</span>
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm mt-1">Probá con otro término o quitá el filtro de categoría.</p>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-cream-200">
        © {new Date().getFullYear()} Pollería La Nobleza · Todos los derechos reservados
      </footer>
    </div>
  );
}
