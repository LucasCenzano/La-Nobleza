import { TipoVenta } from '@prisma/client';

// ─── TipoVenta ─────────────────────────────────────────────────
export const TIPO_VENTA_LABELS: Record<TipoVenta, string> = {
  UNIDAD: 'x Unidad',
  PESO:   'x Kg',
};

export function formatPrecio(precio: number, tipoVenta: TipoVenta): string {
  const fmt = new Intl.NumberFormat('es-AR', {
    style:                 'currency',
    currency:              'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
  return `${fmt} ${TIPO_VENTA_LABELS[tipoVenta]}`;
}

export function formatPrecioSolo(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style:                 'currency',
    currency:              'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

// ─── Etiquetas ─────────────────────────────────────────────────
export type EtiquetaSlug = 'NUEVO' | 'DESTACADO' | 'OFERTA' | 'SIN_STOCK';

export interface EtiquetaConfig {
  slug:  EtiquetaSlug;
  label: string;
  emoji: string;
  bg:    string;   // Tailwind bg class
  text:  string;   // Tailwind text class
}

export const ETIQUETAS: EtiquetaConfig[] = [
  { slug: 'NUEVO',     label: 'Nuevo',     emoji: '✨', bg: 'bg-green-100',  text: 'text-green-700'  },
  { slug: 'DESTACADO', label: 'Destacado', emoji: '⭐', bg: 'bg-purple-100', text: 'text-purple-700' },
  { slug: 'OFERTA',    label: 'Oferta',    emoji: '🔥', bg: 'bg-red-100',    text: 'text-red-700'    },
  { slug: 'SIN_STOCK', label: 'Sin Stock', emoji: '⛔', bg: 'bg-gray-100',   text: 'text-gray-500'   },
];

export const ETIQUETA_MAP = Object.fromEntries(
  ETIQUETAS.map((e) => [e.slug, e]),
) as Record<EtiquetaSlug, EtiquetaConfig>;

// ─── CategoriaConfig type (mirrors Prisma model) ───────────────
export interface CategoriaConfigType {
  id:     string;
  nombre: string;
  slug:   string;
  emoji:  string;
  color:  string;
  orden:  number;
  activo: boolean;
}

// ─── Fallback label helper (for when categories aren't loaded) ─
export function getCategoriaLabel(
  slug: string,
  categorias?: CategoriaConfigType[],
): string {
  if (categorias) {
    const found = categorias.find((c) => c.slug === slug);
    if (found) return `${found.emoji} ${found.nombre}`;
  }
  // Fallback: humanize slug
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
