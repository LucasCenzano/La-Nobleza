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

  const activeCategory = categorias.find(c => c.slug === categoria);

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

      <div className="mt-1">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 px-4">
          Explorar por Categoría
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-4 scroll-x-hide px-4">
          {/* Chip: Todas */}
          <button
            onClick={() => {
              onCategoriaChange('');
              onEtiquetaChange('');
            }}
            className={`
              flex-shrink-0 flex items-center gap-2
              px-4 py-2.5
              rounded-2xl
              text-[13px] font-bold
              transition-all duration-200 active:scale-95
              border-2
              ${categoria === ''
                ? 'bg-[var(--black-charcoal)] text-white border-[var(--black-charcoal)] shadow-lg shadow-black/10'
                : 'bg-white text-gray-600 border-gray-100/80 hover:border-gray-200'
              }
            `}
          >
            <span className="text-sm">🛒</span>
            <span>Todas</span>
          </button>

          {/* Category Chips */}
          {categorias.filter(c => c.slug !== '').map((cat) => {
            const isActive = categoria === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoriaChange(cat.slug);
                  onEtiquetaChange('');
                }}
                className={`
                  flex-shrink-0 flex items-center gap-2
                  px-4 py-2.5
                  rounded-2xl
                  text-[13px] font-bold
                  transition-all duration-200 active:scale-95
                  border-2
                  ${isActive
                    ? 'bg-[var(--gold-main)] text-white border-[var(--gold-main)] shadow-lg shadow-[var(--gold-main)]/20'
                    : 'bg-white text-gray-600 border-gray-100/80 hover:border-gray-200'
                  }
                `}
              >
                <span className="text-base shrink-0">{cat.emoji}</span>
                <span>{cat.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Botones de Acceso Rápido (Ofertas, Destacados) */}
        <div className="flex gap-2.5 mt-1 overflow-x-auto pb-4 scroll-x-hide px-4">
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
                  px-4 py-2.5
                  rounded-2xl
                  text-[13px] font-bold
                  transition-all duration-200 active:scale-95
                  border-2
                  ${isActive
                    ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-lg shadow-red-200'
                    : 'bg-red-50 text-red-700 border-red-100/50 hover:bg-red-100 hover:border-red-200'
                  }
                `}
              >
                <span className="text-sm shrink-0">{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
    </div>
  );
}
