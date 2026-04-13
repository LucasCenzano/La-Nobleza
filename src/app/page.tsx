import { Suspense } from 'react';
import { Categoria, TipoVenta } from '@prisma/client';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ProductCard from '@/components/catalog/ProductCard';
import SearchFilters from '@/components/catalog/SearchFilters';

interface HomePageProps {
  searchParams: {
    q?:         string;
    categoria?: string;
  };
}

// Datos de ejemplo para modo demo (sin BD conectada)
const MOCK_PRODUCTOS = [
  { id: '1', nombre: 'Pollo Entero', descripcion: 'Pollo entero fresco, listo para cocinar.', precio: 3500, categoria: 'POLLO_ENTERO' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', nombre: 'Pechuga sin hueso', descripcion: 'Pechuga deshuesada y limpia. Ideal para milanesas.', precio: 5200, categoria: 'PRESAS' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', nombre: 'Muslo y Contramuslo', descripcion: 'Porción jugosa, ideal para el asado o al horno.', precio: 4100, categoria: 'PRESAS' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', nombre: 'Huevos de Campo (docena)', descripcion: 'Docena de huevos frescos de campo.', precio: 1800, categoria: 'HUEVOS' as Categoria, tipoVenta: 'UNIDAD' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', nombre: 'Menudos Surtidos', descripcion: 'Molleja, hígado y corazón. Especial para parrilla.', precio: 2200, categoria: 'MENUDENCIAS' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', nombre: 'Alitas de Pollo', descripcion: 'Alitas frescas, perfectas para el horno o fritas.', precio: 3200, categoria: 'PRESAS' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '7', nombre: 'Salchicha Parrillera', descripcion: 'Salchicha artesanal de pollo para asado.', precio: 2800, categoria: 'EMBUTIDOS' as Categoria, tipoVenta: 'PESO' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '8', nombre: 'Carcasa de Pollo', descripcion: 'Ideal para caldos y sopas caseras.', precio: 800, categoria: 'OTROS' as Categoria, tipoVenta: 'UNIDAD' as TipoVenta, imagenUrl: null, activo: true, createdAt: new Date(), updatedAt: new Date() },
];

async function getProductos(q?: string, categoria?: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    return await prisma.producto.findMany({
      where: {
        activo: true,
        ...(categoria && Object.values(Categoria).includes(categoria as Categoria)
          ? { categoria: categoria as Categoria }
          : {}),
        ...(q
          ? { nombre: { contains: q, mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });
  } catch {
    // Sin BD configurada → retorna datos de demo
    return MOCK_PRODUCTOS.filter((p) => {
      const matchQ   = !q        || p.nombre.toLowerCase().includes(q.toLowerCase());
      const matchCat = !categoria || p.categoria === categoria;
      return matchQ && matchCat;
    });
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const isDemoMode = process.env.DATABASE_URL?.includes('localhost') ?? false;
  const productos  = await getProductos(searchParams.q, searchParams.categoria);

  return (
    <div className="min-h-screen flex flex-col">
      <CatalogHeader />

      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium">
          ⚡ Modo demo — conectá tu base de datos Neon en <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> para ver datos reales
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
              <ProductCard key={p.id} producto={p} />
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
