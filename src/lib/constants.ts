import { Categoria, TipoVenta } from '@prisma/client';

export const CATEGORIA_LABELS: Record<Categoria, string> = {
  POLLO_ENTERO:  'Pollo Entero',
  PRESAS:        'Presas',
  MENUDENCIAS:   'Menudencias',
  EMBUTIDOS:     'Embutidos',
  HUEVOS:        'Huevos',
  OTROS:         'Otros',
};

export const TIPO_VENTA_LABELS: Record<TipoVenta, string> = {
  UNIDAD: 'x Unidad',
  PESO:   'x Kg',
};

export function formatPrecio(precio: number, tipoVenta: TipoVenta): string {
  const fmt = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
  return `${fmt} ${TIPO_VENTA_LABELS[tipoVenta]}`;
}
