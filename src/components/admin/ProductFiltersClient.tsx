'use client';

import { CategoriaConfigType, ETIQUETAS } from '@/lib/constants';

interface Props {
  categorias: CategoriaConfigType[];
  totalCount: number;
  state: {
    q:         string;
    estado:    string;
    categoria: string;
    etiqueta:  string;
    sort:      string;
  };
  setState: {
    setQ:         (v: string) => void;
    setEstado:    (v: string) => void;
    setCategoria: (v: string) => void;
    setEtiqueta:  (v: string) => void;
    setSort:      (v: string) => void;
  };
  clearAll: () => void;
}

const ESTADO_OPTIONS = [
  { value: '',           label: 'Todos los estados' },
  { value: 'activos',    label: '✅ Activos' },
  { value: 'pausados',   label: '⏸️ Pausados' },
  { value: 'sin_foto',   label: '📷 Sin foto' },
  { value: 'en_oferta',  label: '🔥 En oferta' },
];

const SORT_OPTIONS = [
  { value: '',             label: 'Orden por defecto' },
  { value: 'nombre_asc',  label: 'Nombre A→Z' },
  { value: 'nombre_desc', label: 'Nombre Z→A' },
  { value: 'precio_asc',  label: 'Precio ↑' },
  { value: 'precio_desc', label: 'Precio ↓' },
  { value: 'fecha_desc',  label: 'Más recientes' },
  { value: 'fecha_asc',   label: 'Más antiguos' },
];

export default function ProductFiltersClient({ categorias, totalCount, state, setState, clearAll }: Props) {
  const { q, estado, categoria, etiqueta, sort } = state;
  const hasFilters = !!(q || estado || categoria || etiqueta || sort);

  return (
    <div className="card p-4 mb-6 space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre o descripción..."
            value={q}
            onChange={(e) => setState.setQ(e.target.value)}
            className="input pl-9"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="btn-secondary text-sm px-3 whitespace-nowrap"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={estado}
          onChange={(e) => setState.setEstado(e.target.value)}
          className="input text-sm"
        >
          {ESTADO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={categoria}
          onChange={(e) => setState.setCategoria(e.target.value)}
          className="input text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.nombre}
            </option>
          ))}
        </select>

        <select
          value={etiqueta}
          onChange={(e) => setState.setEtiqueta(e.target.value)}
          className="input text-sm"
        >
          <option value="">Todas las etiquetas</option>
          {ETIQUETAS.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.emoji} {e.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setState.setSort(e.target.value)}
          className="input text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-gray-400 self-center">Filtros activos:</span>
          {estado && (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-medium">
              {ESTADO_OPTIONS.find((o) => o.value === estado)?.label}
              <button onClick={() => setState.setEstado('')} className="hover:text-brand-900 ml-0.5">✕</button>
            </span>
          )}
          {categoria && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">
              {categorias.find((c) => c.slug === categoria)?.emoji}{' '}
              {categorias.find((c) => c.slug === categoria)?.nombre ?? categoria}
              <button onClick={() => setState.setCategoria('')} className="hover:text-orange-900 ml-0.5">✕</button>
            </span>
          )}
          {etiqueta && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
              {ETIQUETAS.find((e) => e.slug === etiqueta)?.emoji}{' '}
              {ETIQUETAS.find((e) => e.slug === etiqueta)?.label ?? etiqueta}
              <button onClick={() => setState.setEtiqueta('')} className="hover:text-purple-900 ml-0.5">✕</button>
            </span>
          )}
          {q && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
              🔍 "{q}"
              <button onClick={() => setState.setQ('')} className="hover:text-gray-900 ml-0.5">✕</button>
            </span>
          )}
          <span className="text-xs text-gray-400 self-center ml-auto">
            {totalCount} resultado{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
