'use client';

import { useCallback, useState, useTransition } from 'react';
import { CategoriaConfigType } from '@/lib/constants';

interface SearchFiltersProps {
  query: string;
  onQueryChange: (val: string) => void;
  categoria: string;
  onCategoriaChange: (val: string) => void;
  etiqueta: string;
  onEtiquetaChange: (val: string) => void;
  categorias: CategoriaConfigType[];
}

export default function SearchFilters({
  query, onQueryChange,
  categoria, onCategoriaChange,
  etiqueta, onEtiquetaChange,
  categorias
}: SearchFiltersProps) {

  return (
    <div className="flex flex-col gap-3 sticky top-[72px] md:top-0 md:relative z-30 bg-[var(--bg-cream)] md:bg-transparent pt-2 pb-3 md:pb-0">
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
          placeholder="Buscar producto"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="input-search"
          aria-label="Buscar productos"
        />
      </div>

      {/* Category & Tag Pills Wrapper */}
      <div className="relative md:static mt-2 md:mt-4">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 mb-2 md:hidden">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest pl-1">
            Categorías
          </span>
          <div className="text-[10px] text-[var(--gold-dark)] font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shadow-sm animate-pulse">
            Deslizar <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </div>
        </div>

        {/* Desktop section title */}
        <div className="hidden md:block px-4 mb-3 border-b border-gray-200/50 pb-2">
           <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Navegación</h2>
        </div>
        
        {/* Gradient Fade to indicate scroll on Mobile */}
        <div className="absolute right-0 bottom-0 top-[22px] w-10 bg-gradient-to-l from-[var(--bg-cream)] to-transparent pointer-events-none z-10 md:hidden" />

        {/* ── Buttons container ── */}
        {/* Mobile: horizontal scroll pills | Desktop: stacked full-width buttons */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible scroll-x-hide px-4 pb-2 snap-x md:items-stretch">

          {/* ── 'Todos' button ── */}
          <button
            onClick={() => {
               onCategoriaChange('');
               onEtiquetaChange('');
            }}
            className={`
              flex-shrink-0 flex items-center
              px-4 py-1.5
              md:w-full md:py-2.5 md:px-4
              rounded-full md:rounded-xl
              text-[13px] md:text-sm font-semibold text-left
              transition-all duration-200 active:scale-[0.97]
              border
              ${categoria === '' && etiqueta === ''
                ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-md'
                : 'bg-white text-gray-600 border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Todos
          </button>

          {/* ── Special Tags (Ofertas, Destacados, Nuevos) ── */}
          {['OFERTA', 'DESTACADO', 'NUEVO'].map((tag) => {
            const isActive = etiqueta === tag;
            const config: Record<string, { label: string; emoji: string }> = {
              OFERTA:    { label: 'Ofertas',    emoji: '🔥' },
              DESTACADO: { label: 'Destacados', emoji: '⭐' },
              NUEVO:     { label: 'Nuevos',     emoji: '🆕' },
            };
            const { label, emoji } = config[tag];
            
            return (
              <button
                key={tag}
                onClick={() => {
                    onEtiquetaChange(isActive ? '' : tag);
                    onCategoriaChange('');
                }}
                className={`
                  flex-shrink-0 flex items-center gap-2
                  px-4 py-1.5
                  md:w-full md:py-2.5 md:px-4
                  rounded-full md:rounded-xl
                  text-[13px] md:text-sm font-semibold text-left
                  transition-all duration-200 active:scale-[0.97]
                  border
                  ${isActive
                    ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-md'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                  }
                `}
              >
                <span className="text-base leading-none w-5 text-center shrink-0">{emoji}</span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}

          {/* ── Category buttons ── */}
          {categorias.filter(c => c.slug !== '').map((cat) => {
            const isActive = categoria === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => {
                    onCategoriaChange(isActive ? '' : cat.slug);
                    onEtiquetaChange('');
                }}
                className={`
                  flex-shrink-0 flex items-center gap-2
                  px-4 py-1.5
                  md:w-full md:py-2.5 md:px-4
                  rounded-full md:rounded-xl
                  text-[13px] md:text-sm font-semibold text-left
                  transition-all duration-200 active:scale-[0.97]
                  border
                  ${isActive
                    ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-base md:text-lg leading-none w-5 text-center shrink-0">{cat.emoji}</span>
                <span className="truncate">{cat.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
