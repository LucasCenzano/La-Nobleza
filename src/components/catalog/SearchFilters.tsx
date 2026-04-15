'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { CategoriaConfigType } from '@/lib/constants';

const STATIC_CATEGORIAS: CategoriaConfigType[] = [
  { id: '0',  slug: '',                     nombre: 'Todos',                          emoji: '', color: '#000', orden: -1, activo: true },
  { id: '1',  slug: 'POLLERIA',             nombre: 'Pollería',                       emoji: '🍗', color: '#000', orden: 0,  activo: true },
  { id: '2',  slug: 'PESCADERIA',           nombre: 'Pescadería',                     emoji: '🐟', color: '#000', orden: 1,  activo: true },
  { id: '3',  slug: 'PASTAS',               nombre: 'Pastas',                         emoji: '🍝', color: '#000', orden: 2,  activo: true },
  { id: '4',  slug: 'COMIDAS_PREPARADAS',   nombre: 'Comidas Preparadas',             emoji: '🍲', color: '#000', orden: 3,  activo: true },
  { id: '5',  slug: 'CONGELADOS',           nombre: 'Congelados',                     emoji: '🧊', color: '#000', orden: 4,  activo: true },
  { id: '6',  slug: 'ALMACEN',              nombre: 'Almacén',                        emoji: '🫙', color: '#000', orden: 5,  activo: true },
  { id: '7',  slug: 'IMPORTADOS_ESPECIALES',nombre: 'Productos Importados / Especiales', emoji: '🌎', color: '#000', orden: 6,  activo: true },
  { id: '8',  slug: 'ESPECIAS',             nombre: 'Especias',                       emoji: '🌶️', color: '#000', orden: 7,  activo: true },
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

      {/* Category & Tag Pills Wrapper */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 mb-2">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest pl-1">
            Categorías
          </span>
          <div className="text-[10px] text-[var(--gold-dark)] font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shadow-sm animate-pulse">
            Deslizar <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </div>
        </div>
        
        {/* Gradient Fade to indicate scroll */}
        <div className="absolute right-0 bottom-0 top-[22px] w-10 bg-gradient-to-l from-[var(--bg-cream)] to-transparent pointer-events-none z-10" />

        <div className="flex gap-2 overflow-x-auto scroll-x-hide px-4 pb-2 snap-x">
          {/* 'Todos' pill */}
        <button
          onClick={() => handleCategory('')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 border ${currentCat === '' && !searchParams.get('etiqueta') ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-[0_4px_10px_rgba(0,0,0,0.15)]' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
        >
          Todos
        </button>

        {/* Special Tags */}
        {['OFERTA', 'DESTACADO', 'NUEVO'].map((tag) => {
          const isActive = searchParams.get('etiqueta') === tag;
          const labels: Record<string, string> = { OFERTA: '🔥 Ofertas', DESTACADO: '⭐ Destacados', NUEVO: '🆕 Nuevos' };
          
          return (
            <button
              key={tag}
              onClick={() => {
                startTransition(() => {
                  const nextTag = isActive ? '' : tag;
                  router.push(`${pathname}?${createQueryString({ q: currentQuery, categoria: '', etiqueta: nextTag })}`);
                });
              }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 border ${isActive ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-[0_4px_10px_rgba(220,38,38,0.25)]' : 'bg-red-50 text-red-700 border-red-200 shadow-sm'}`}
            >
              {labels[tag]}
            </button>
          );
        })}

        {/* Categories */}
        {categorias.filter(c => c.slug !== '').map((cat) => {
          const isActive = currentCat === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => {
                startTransition(() => {
                  const next = isActive ? '' : cat.slug;
                  router.push(`${pathname}?${createQueryString({ q: currentQuery, categoria: next, etiqueta: '' })}`);
                });
              }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 border ${isActive ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-[0_4px_10px_rgba(0,0,0,0.15)]' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
            >
              {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}
              {cat.nombre}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
