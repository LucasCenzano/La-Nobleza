import { Suspense } from 'react';
import { TipoVenta } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ProductCard from '@/components/catalog/ProductCard';
import SearchFilters from '@/components/catalog/SearchFilters';
import BottomNav from '@/components/catalog/BottomNav';
import { CatalogBanner, getCatalogConfig } from '@/components/catalog/CatalogInfo';
import { CategoriaConfigType } from '@/lib/constants';

interface HomePageProps {
  searchParams: {
    q?:         string;
    categoria?: string;
  };
}

// ── Rich mock catalog with almacén-full inventory ────────────────
const MOCK_PRODUCTOS = [
  // Pollo
  {
    id: '1', nombre: 'Pollo Entero Fresco',
    descripcion: 'Pollo entero, fresco del día. Rendidor y jugoso.',
    precio: 4200, precioOferta: null,
    categoria: 'POLLO_ENTERO', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '2', nombre: 'Pechuga sin Hueso',
    descripcion: 'Pechuga limpia y deshuesada. Ideal para milanesas o ensaladas.',
    precio: 5500, precioOferta: 4800,
    categoria: 'PRESAS', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '3', nombre: 'Alitas Frescas x 2kg',
    descripcion: 'Super Oferta — 2kg de alitas frescas.',
    precio: 6000, precioOferta: 5000,
    categoria: 'PRESAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '4', nombre: 'Muslo y Contramuslo',
    descripcion: 'Porción jugosa, ideal para el horno o la parrilla.',
    precio: 4800, precioOferta: null,
    categoria: 'PRESAS', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Almacén
  {
    id: '5', nombre: 'Arroz Amanda x 1kg',
    descripcion: 'Arroz largo fino. Calidad garantizada.',
    precio: 6200, precioOferta: 5000,
    categoria: 'ALMACEN', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '6', nombre: 'Salsa Sriracha Hot',
    descripcion: 'La famosa salsa picante con tapa verde. Producto importado.',
    precio: 3800, precioOferta: null,
    categoria: 'ALMACEN', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Huevos
  {
    id: '7', nombre: 'Huevos de Campo',
    descripcion: 'Docena de huevos frescos. Selección, Super Selección o Campo.',
    precio: 2400, precioOferta: null,
    categoria: 'HUEVOS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Carnicería
  {
    id: '8', nombre: 'Asado de Tira',
    descripcion: 'Corte parrillero por excelencia. Carne fresca del día.',
    precio: 7800, precioOferta: null,
    categoria: 'CARNICERIA', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '9', nombre: 'Milanesas de Ternera',
    descripcion: 'Milanesas tiernas y bien fileteadas. Listas para cocinar.',
    precio: 8500, precioOferta: 7500,
    categoria: 'CARNICERIA', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Pastas
  {
    id: '10', nombre: 'Empanadas Frescas x12',
    descripcion: 'Empanadas artesanales de carne, humita o queso y cebolla.',
    precio: 4500, precioOferta: null,
    categoria: 'PASTAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '11', nombre: 'Pasta Fresca Tallarín',
    descripcion: 'Tallarines artesanales, tiernos y de textura perfecta.',
    precio: 3200, precioOferta: null,
    categoria: 'PASTAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Pescado
  {
    id: '12', nombre: 'Merluza Fresca',
    descripcion: 'Merluza en filet, sin espinas. Ideal al vapor o a la plancha.',
    precio: 5100, precioOferta: 4400,
    categoria: 'PESCADO', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Lácteos
  {
    id: '13', nombre: 'Leche Entera La Serenísima',
    descripcion: 'Sachet de 1 litro. Fresca y de calidad.',
    precio: 1200, precioOferta: null,
    categoria: 'LACTEOS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Embutidos
  {
    id: '14', nombre: 'Salchicha Parrillera de Pollo',
    descripcion: 'Artesanal, sin conservantes artificiales. Especial para el asado.',
    precio: 3200, precioOferta: 2600,
    categoria: 'EMBUTIDOS', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA', 'DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Panadería
  {
    id: '15', nombre: 'Pan de Campo Artesanal',
    descripcion: 'Horneado fresco todos los días. Crujiente por fuera, tierno por dentro.',
    precio: 1600, precioOferta: null,
    categoria: 'PANADERIA', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Menudencias
  {
    id: '16', nombre: 'Molleja de Pollo',
    descripcion: 'Especial para la parrilla. Tierna y muy sabrosa.',
    precio: 2800, precioOferta: null,
    categoria: 'MENUDENCIAS', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
];

const MOCK_CATEGORIAS: CategoriaConfigType[] = [
  { id: '1',  slug: 'POLLO_ENTERO', nombre: 'Pollo',           emoji: '🐔', color: '#000', orden: 0,  activo: true },
  { id: '2',  slug: 'PRESAS',       nombre: 'Presas',          emoji: '🍗', color: '#000', orden: 1,  activo: true },
  { id: '3',  slug: 'MENUDENCIAS',  nombre: 'Menudencias',     emoji: '🫀', color: '#000', orden: 2,  activo: true },
  { id: '4',  slug: 'EMBUTIDOS',    nombre: 'Embutidos',       emoji: '🌭', color: '#000', orden: 3,  activo: true },
  { id: '5',  slug: 'HUEVOS',       nombre: 'Huevos',          emoji: '🥚', color: '#000', orden: 4,  activo: true },
  { id: '6',  slug: 'CARNICERIA',   nombre: 'Carnicería',      emoji: '🥩', color: '#000', orden: 5,  activo: true },
  { id: '7',  slug: 'PESCADO',      nombre: 'Pescado',         emoji: '🐟', color: '#000', orden: 6,  activo: true },
  { id: '8',  slug: 'PASTAS',       nombre: 'Pastas Frescas',  emoji: '🍝', color: '#000', orden: 7,  activo: true },
  { id: '9',  slug: 'ALMACEN',      nombre: 'Almacén',         emoji: '🫙', color: '#000', orden: 8,  activo: true },
  { id: '10', slug: 'LACTEOS',      nombre: 'Lácteos',         emoji: '🥛', color: '#000', orden: 9,  activo: true },
  { id: '11', slug: 'PANADERIA',    nombre: 'Panadería',       emoji: '🥐', color: '#000', orden: 10, activo: true },
  { id: '12', slug: 'OTROS',        nombre: 'Otros',           emoji: '📦', color: '#000', orden: 11, activo: true },
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
    <div className="flex flex-col min-h-screen relative bg-[var(--bg-cream)]">
      <CatalogHeader />
      
      <Suspense>
        <SearchFilters />
      </Suspense>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 mb-16">
        {/* Banner from DB, shown conditionally if present */}
        {catalogConfig?.bannerActivo && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
            <CatalogBanner config={catalogConfig} />
          </div>
        )}

        {/* ── Results count ── */}
        <p className="text-[12px] font-semibold mb-3 tracking-wide text-gray-500 uppercase">
          {productos.length === 0
            ? 'Sin resultados'
            : `${productos.length} producto${productos.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Product Grid (2 Columns Mobile-First) ── */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p as any} categorias={categorias} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <span className="text-4xl block mb-3 opacity-60">🔍</span>
            <p className="font-semibold text-[var(--black-charcoal)] text-lg">No encontramos productos</p>
            <p className="text-sm mt-1 text-gray-500 max-w-[250px]">
              Intentá con otra palabra u otra categoría.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
