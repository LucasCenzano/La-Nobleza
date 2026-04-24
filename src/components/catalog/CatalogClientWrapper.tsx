'use client';

import { useState, useMemo } from 'react';
import SearchFilters from './SearchFilters';
import ProductCard from './ProductCard';
import { CategoriaConfigType } from '@/lib/constants';

interface CatalogClientWrapperProps {
  initialProductos: any[];
  categorias: CategoriaConfigType[];
}

// ── Skeleton card para mostrar mientras carga ───────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      {/* Image placeholder */}
      <div className="w-full bg-gray-100" style={{ aspectRatio: '1 / 1' }} />
      {/* Content placeholder */}
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start w-full relative pb-16 md:pb-8 px-4">
      {/* Filters skeleton */}
      <div className="w-full md:w-[260px] shrink-0 py-4">
        <div className="h-11 bg-gray-100 rounded-xl animate-pulse mb-3" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-100 rounded-full animate-pulse shrink-0" />
          ))}
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="flex-1 w-full py-4 md:pl-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogClientWrapper({ initialProductos, categorias }: CatalogClientWrapperProps) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [tag, setTag] = useState('');

  const filtered = useMemo(() => {
    const normalizeString = (str: string) => 
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    return initialProductos.filter((p) => {
      const matchQ = !q || normalizeString(p.nombre).includes(normalizeString(q));
      const matchCat = !cat || p.categoria === cat;
      const matchTag = !tag || p.etiquetas?.includes(tag);
      return matchQ && matchCat && matchTag;
    });
  }, [initialProductos, q, cat, tag]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start w-full relative pb-16 md:pb-8">
      <aside className="w-full md:w-[260px] lg:w-[280px] shrink-0 md:sticky md:top-[88px] z-30 md:pt-6">
        <SearchFilters 
          query={q} onQueryChange={setQ}
          categoria={cat} onCategoriaChange={setCat}
          etiqueta={tag} onEtiquetaChange={setTag}
          categorias={categorias}
        />
      </aside>

      <main className="flex-1 w-full px-4 py-4 mb-4 min-w-0 md:pt-6 md:pl-8">
        {/* ── Results count ── */}
        <p className="text-[12px] font-semibold mb-3 lg:mb-5 tracking-wide text-gray-500 uppercase">
          {filtered.length === 0
            ? 'Sin resultados'
            : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Product Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {filtered.map((p, i) => (
              <ProductCard 
                key={p.id} 
                producto={p} 
                categorias={categorias}
                animationIndex={i}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
            <span className="text-5xl block mb-4 opacity-40">🔍</span>
            <p className="font-bold text-[var(--black-charcoal)] text-xl">No encontramos productos</p>
            <p className="text-sm mt-2 text-gray-500 max-w-xs mx-auto">
              Intentá con otra palabra u otra categoría en el panel.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
