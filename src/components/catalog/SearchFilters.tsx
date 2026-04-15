'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { CategoriaConfigType } from '@/lib/constants';

const STATIC_CATEGORIAS: CategoriaConfigType[] = [
  { id: '0',  slug: '',              nombre: 'Todos',           emoji: '', color: '#000', orden: -1, activo: true },
  { id: '1',  slug: 'OFERTAS',       nombre: 'Ofertas',         emoji: '🔥', color: '#dc2626', orden: 0,  activo: true },
  { id: '2',  slug: 'POLLO_ENTERO',  nombre: 'Pollo Entero',    emoji: '', color: '#000', orden: 1,  activo: true },
  { id: '3',  slug: 'PRESAS',        nombre: 'Presas',          emoji: '', color: '#000', orden: 2,  activo: true },
  { id: '4',  slug: 'EMBUTIDOS',     nombre: 'Embutidos',       emoji: '', color: '#000', orden: 3,  activo: true },
  { id: '5',  slug: 'HUEVOS',        nombre: 'Huevos',          emoji: '', color: '#000', orden: 4,  activo: true },
  { id: '6',  slug: 'ALMACEN',       nombre: 'Almacén',         emoji: '', color: '#000', orden: 5,  activo: true },
];

export default function SearchFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [categorias, setCategorias]  = useState<CategoriaConfigType[]>(STATIC_CATEGORIAS);

  const currentQuery = searchParams.get('q')         ?? '';
  const currentCat   = searchParams.get('categoria') ?? '';

  useEffect(() => {
    fetch('/api/public/categorias')
      .then((r) => r.json())
      .then((data: CategoriaConfigType[]) => {
        if (data?.length > 0) {
          setCategorias([
            { id: '0', slug: '', nombre: 'Todos', emoji: '', color: '#000', orden: -1, activo: true },
            ...data,
          ]);
        }
      })
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

  function handleCategory(slug: string) {
    startTransition(() => {
      const next = currentCat === slug ? '' : slug;
      router.push(`${pathname}?${createQueryString({ q: currentQuery, categoria: next })}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sticky top-[72px] z-30 bg-[var(--bg-cream)] pt-2 pb-3">
      {/* Search Input */}
      <div className="relative px-4">
        <span className="absolute left-7 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          id="catalog-search"
          type="search"
          placeholder="Buscar productos..."
          defaultValue={currentQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="input-search"
          aria-label="Buscar productos"
        />
        {isPending && (
          <span className="absolute right-7 top-1/2 -translate-y-1/2 animate-spin text-[var(--gold-dark)]" aria-hidden="true">
            ⟳
          </span>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto scroll-x-hide px-4 pb-1">
        {categorias.map((cat) => {
          const isActive = cat.slug === '' ? currentCat === '' : currentCat === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.slug)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 border ${isActive ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-[0_4px_10px_rgba(0,0,0,0.15)]' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
            >
              {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}
              {cat.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
