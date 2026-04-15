'use client';

import { useState, useMemo } from 'react';
import SearchFilters from './SearchFilters';
import ProductCard from './ProductCard';
import { CategoriaConfigType } from '@/lib/constants';

interface CatalogClientWrapperProps {
  initialProductos: any[];
  categorias: CategoriaConfigType[];
}

export default function CatalogClientWrapper({ initialProductos, categorias }: CatalogClientWrapperProps) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [tag, setTag] = useState('');

  const filtered = useMemo(() => {
    return initialProductos.filter((p) => {
      const matchQ = !q || p.nombre.toLowerCase().includes(q.toLowerCase());
      const matchCat = !cat || p.categoria === cat;
      const matchTag = !tag || p.etiquetas?.includes(tag);
      return matchQ && matchCat && matchTag;
    });
  }, [initialProductos, q, cat, tag]);

  return (
    <>
      <SearchFilters 
        query={q} onQueryChange={setQ}
        categoria={cat} onCategoriaChange={setCat}
        etiqueta={tag} onEtiquetaChange={setTag}
        categorias={categorias}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 mb-4">
        {/* ── Results count ── */}
        <p className="text-[12px] font-semibold mb-3 tracking-wide text-gray-500 uppercase">
          {filtered.length === 0
            ? 'Sin resultados'
            : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Product Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} producto={p} categorias={categorias} />
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
    </>
  );
}
