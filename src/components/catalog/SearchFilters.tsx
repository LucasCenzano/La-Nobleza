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

      <div className="px-4 mt-2">
        {/* Selector de Categoría (Dropdown) */}
        <div className="relative group">
          <label htmlFor="category-select" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 pl-1">
            Explorar Categoría
          </label>
          <div className="relative">
            <select
              id="category-select"
              value={categoria}
              onChange={(e) => {
                onCategoriaChange(e.target.value);
                onEtiquetaChange('');
              }}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-[var(--gold-main)]/10 focus:border-[var(--gold-main)] transition-all cursor-pointer"
            >
              <option value="">🛒 Todas las categorías</option>
              {categorias.filter(c => c.slug !== '').map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.emoji} {cat.nombre}
                </option>
              ))}
            </select>
            
            {/* Flecha personalizada */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Botones de Acceso Rápido (Ofertas, Destacados) */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scroll-x-hide">
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
                  px-4 py-2
                  rounded-xl
                  text-[13px] font-bold
                  transition-all duration-200 active:scale-95
                  border
                  ${isActive
                    ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-lg shadow-red-200'
                    : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200'
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
    </div>
  );
}
