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
    etiqueta?:  string;
  };
}

// ── Rich mock catalog ────────────────────────────────────────────
const MOCK_PRODUCTOS = [
  // Pollería
  {
    id: '1', nombre: 'Pollo Entero Fresco',
    descripcion: 'Pollo entero, fresco del día. Rendidor y jugoso.',
    precio: 4200, precioOferta: null,
    categoria: 'POLLERIA', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '2', nombre: 'Pechuga sin Hueso',
    descripcion: 'Pechuga limpia y deshuesada. Ideal para milanesas o ensaladas.',
    precio: 5500, precioOferta: 4800,
    categoria: 'POLLERIA', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '3', nombre: 'Alitas Frescas x 2kg',
    descripcion: 'Super Oferta — 2kg de alitas frescas.',
    precio: 6000, precioOferta: 5000,
    categoria: 'POLLERIA', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Pescadería
  {
    id: '4', nombre: 'Merluza Fresca en Filet',
    descripcion: 'Merluza en filet, sin espinas. Ideal al vapor o a la plancha.',
    precio: 5100, precioOferta: 4400,
    categoria: 'PESCADERIA', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '5', nombre: 'Salmón Rosado',
    descripcion: 'Filet de salmón fresco, ideal para horno o plancha.',
    precio: 9800, precioOferta: null,
    categoria: 'PESCADERIA', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Pastas
  {
    id: '6', nombre: 'Tallarines Artesanales',
    descripcion: 'Tallarines frescos, tiernos y de textura perfecta.',
    precio: 3200, precioOferta: null,
    categoria: 'PASTAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '7', nombre: 'Ravioles de Ricota y Nuez',
    descripcion: 'Rellenos artesanales con ricota cremosa y nuez.',
    precio: 4500, precioOferta: null,
    categoria: 'PASTAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Comidas Preparadas
  {
    id: '8', nombre: 'Empanadas Frescas x12',
    descripcion: 'Empanadas artesanales de carne, humita o queso y cebolla.',
    precio: 4500, precioOferta: null,
    categoria: 'COMIDAS_PREPARADAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '9', nombre: 'Milanesas de Pollo Listas',
    descripcion: 'Milanesas rebozadas, listas para freír o al horno.',
    precio: 6200, precioOferta: 5500,
    categoria: 'COMIDAS_PREPARADAS', tipoVenta: 'PESO' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Congelados
  {
    id: '10', nombre: 'Papas Congeladas McCain',
    descripcion: 'Papas bastón congeladas, listas para freír.',
    precio: 3800, precioOferta: null,
    categoria: 'CONGELADOS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Almacén
  {
    id: '11', nombre: 'Arroz Amanda x 1kg',
    descripcion: 'Arroz largo fino. Calidad garantizada.',
    precio: 6200, precioOferta: 5000,
    categoria: 'ALMACEN', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['OFERTA'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Productos Importados / Especiales
  {
    id: '12', nombre: 'Salsa Sriracha Hot',
    descripcion: 'La famosa salsa picante con tapa verde. Producto importado.',
    precio: 3800, precioOferta: null,
    categoria: 'IMPORTADOS_ESPECIALES', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '13', nombre: 'Aceite de Oliva Extra Virgen Italiano',
    descripcion: 'Aceite premium importado de Italia. 500ml.',
    precio: 12500, precioOferta: null,
    categoria: 'IMPORTADOS_ESPECIALES', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['DESTACADO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  // Especias
  {
    id: '14', nombre: 'Pimentón Ahumado',
    descripcion: 'Pimentón ahumado de primera calidad. Ideal para carnes y salsas.',
    precio: 1800, precioOferta: null,
    categoria: 'ESPECIAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: [], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '15', nombre: 'Mix de Hierbas Provenzales',
    descripcion: 'Mezcla artesanal de hierbas secas para condimentar.',
    precio: 1500, precioOferta: null,
    categoria: 'ESPECIAS', tipoVenta: 'UNIDAD' as TipoVenta,
    imagenUrl: null, imagenesUrls: [], etiquetas: ['NUEVO'], activo: true,
    createdAt: new Date(), updatedAt: new Date(),
  },
];

const MOCK_CATEGORIAS: CategoriaConfigType[] = [
  { id: '1',  slug: 'POLLERIA',              nombre: 'Pollería',                          emoji: '🍗', color: '#000', orden: 0,  activo: true },
  { id: '2',  slug: 'PESCADERIA',            nombre: 'Pescadería',                        emoji: '🐟', color: '#000', orden: 1,  activo: true },
  { id: '3',  slug: 'PASTAS',                nombre: 'Pastas',                            emoji: '🍝', color: '#000', orden: 2,  activo: true },
  { id: '4',  slug: 'COMIDAS_PREPARADAS',    nombre: 'Comidas Preparadas',                emoji: '🍲', color: '#000', orden: 3,  activo: true },
  { id: '5',  slug: 'CONGELADOS',            nombre: 'Congelados',                        emoji: '🧊', color: '#000', orden: 4,  activo: true },
  { id: '6',  slug: 'ALMACEN',               nombre: 'Almacén',                           emoji: '🫙', color: '#000', orden: 5,  activo: true },
  { id: '7',  slug: 'IMPORTADOS_ESPECIALES', nombre: 'Productos Importados / Especiales', emoji: '🌎', color: '#000', orden: 6,  activo: true },
  { id: '8',  slug: 'ESPECIAS',              nombre: 'Especias',                          emoji: '🌶️', color: '#000', orden: 7,  activo: true },
];

async function getData(q?: string, categoria?: string, etiqueta?: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const { prisma } = await import('@/lib/prisma');
    const [productos, categorias] = await Promise.all([
      prisma.producto.findMany({
        where: {
          activo: true,
          ...(categoria ? { categoria } : {}),
          ...(q ? { nombre: { contains: q, mode: 'insensitive' } } : {}),
          ...(etiqueta ? { etiquetas: { has: etiqueta } } : {}), // For simple db matching
        },
        orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.categoriaConfig.findMany({
        where:   { activo: true },
        orderBy: [{ orden: 'asc' }],
      }),
    ]);

    // Apply auto-tags for business logic (NUEVO & DESTACADO for items < 30 days)
    let processedProducts = productos.map((p) => {
      const etiquetas = new Set(p.etiquetas || []);
      if (p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo) {
        etiquetas.add('NUEVO');
        etiquetas.add('DESTACADO');
      }

      // Scrub Base64 so they don't bloat the Client payload. 
      // Point them to our Image API endpoint which caches efficiently.
      const imagesCount = p.imagenesUrls?.length || (p.imagenUrl ? 1 : 0);
      const fakeUrls = Array.from({ length: imagesCount }).map((_, i) => `/api/images/${p.id}?idx=${i}`);

      return { 
        ...p, 
        etiquetas: Array.from(etiquetas),
        imagenUrl: fakeUrls[0] || null,
        imagenesUrls: fakeUrls,
      };
    });

    // If we rely on auto-tags, we need to filter them in memory if the user requested a tag the DB didn't catch 
    if (etiqueta) {
      processedProducts = processedProducts.filter(p => p.etiquetas.includes(etiqueta));
    }

    return { productos: processedProducts, categorias, demo: false };
  } catch {
    let productos = MOCK_PRODUCTOS.map((p) => {
       const etiquetas = new Set(p.etiquetas || []);
       if (p.createdAt && new Date(p.createdAt) >= thirtyDaysAgo) {
         etiquetas.add('NUEVO');
         etiquetas.add('DESTACADO');
       }
       return { ...p, etiquetas: Array.from(etiquetas) };
    });

    productos = productos.filter((p) => {
      const matchQ   = !q        || p.nombre.toLowerCase().includes(q.toLowerCase());
      const matchCat = !categoria || p.categoria === categoria;
      const matchTag = !etiqueta  || p.etiquetas.includes(etiqueta);
      return matchQ && matchCat && matchTag;
    });

    return { productos, categorias: MOCK_CATEGORIAS, demo: true };
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [{ productos, categorias, demo }, catalogConfig] = await Promise.all([
    getData(searchParams.q, searchParams.categoria, searchParams.etiqueta),
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
