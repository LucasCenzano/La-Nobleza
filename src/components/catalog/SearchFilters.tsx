'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { CategoriaConfigType } from '@/lib/constants';

export default function SearchFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [categorias, setCategorias]  = useState<CategoriaConfigType[]>([]);

  const currentQuery = searchParams.get('q')         ?? '';
  const currentCat   = searchParams.get('categoria') ?? '';

  // Load active categories from DB
  useEffect(() => {
    fetch('/api/public/categorias')
      .then((r) => r.json())
      .then(setCategorias)
      .catch(() => {});
  }, []);

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return params.toString();
    },
    [searchParams],
  );

  function handleSearch(value: string) {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ q: value, categoria: currentCat })}`);
    });
  }

  function handleCategory(cat: string) {
    startTransition(() => {
      const next = currentCat === cat ? '' : cat;
      router.push(`${pathname}?${createQueryString({ q: currentQuery, categoria: next })}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          id="catalog-search"
          type="search"
          placeholder="Buscar productos..."
          defaultValue={currentQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="input pl-9 pr-4"
          aria-label="Buscar productos"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 animate-spin">⟳</span>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtrar por categoría">
        <button
          onClick={() => handleCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            !currentCat
              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
          }`}
        >
          Todos
        </button>

        {categorias.map((cat) => {
          const active = currentCat === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                active
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              {cat.emoji} {cat.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
