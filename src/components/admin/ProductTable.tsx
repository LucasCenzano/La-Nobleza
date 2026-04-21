'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Producto } from '@prisma/client';
import { TIPO_VENTA_LABELS, formatPrecioSolo, getCategoriaLabel, CategoriaConfigType } from '@/lib/constants';
import { TipoVenta } from '@prisma/client';
import Image from 'next/image';
import EtiquetaBadge from '@/components/admin/EtiquetaBadge';

type ProductoExtended = Producto & {
  imagenesUrls?: string[];
  etiquetas?:    string[];
  precioOferta?: number | null;
};

interface ProductTableProps {
  productos:  ProductoExtended[];
  categorias: CategoriaConfigType[];
}

export default function ProductTable({ productos, categorias }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggleActivo(id: string, currentValue: boolean) {
    await fetch(`/api/admin/productos/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ activo: !currentValue }),
    });
    startTransition(() => router.refresh());
  }

  async function eliminarProducto(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
    startTransition(() => router.refresh());
  }

  if (productos.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <span className="text-4xl block mb-2">📦</span>
        <p>No hay productos aún. ¡Creá el primero!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Etiquetas</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Activo</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {productos.map((p) => {
            const thumbRaw     = p.imagenesUrls?.[0] || p.imagenUrl || null;
            const thumb        = thumbRaw ? thumbRaw.split('#framing:')[0] : null;
            const hasOferta    = !!p.precioOferta && p.precioOferta > 0 && p.precioOferta < p.precio;
            const catLabel    = getCategoriaLabel(p.categoria, categorias);

            return (
              <tr
                key={p.id}
                className={`transition-colors duration-150 ${
                  !p.activo ? 'opacity-50 bg-gray-50' : 'hover:bg-cream-50'
                }`}
              >
                {/* Name + thumbnail */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {thumb ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100">
                        <Image src={thumb} alt={p.nombre} fill loading="lazy"
                          className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🍗</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900 leading-tight">{p.nombre}</span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="badge-orange">{catLabel}</span>
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  {p.stock !== null && p.stock !== undefined ? (
                    <span className={`font-bold ${p.stock <= 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {p.stock} {p.tipoVenta === 'PESO' ? 'kg' : 'un.'}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Ilimitado</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {hasOferta ? (
                    <div>
                      <p className="text-xs text-gray-400 line-through leading-none">
                        {formatPrecioSolo(p.precio)}
                      </p>
                      <p className="font-bold text-red-600 text-sm leading-tight">
                        {formatPrecioSolo(p.precioOferta!)}
                        <span className="ml-1 text-[10px] font-semibold bg-red-100 text-red-600 px-1 py-0.5 rounded">
                          -{Math.round((1 - p.precioOferta! / p.precio) * 100)}%
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {TIPO_VENTA_LABELS[p.tipoVenta as TipoVenta]}
                      </p>
                    </div>
                  ) : (
                    <span className="font-semibold text-brand-700">
                      {formatPrecioSolo(p.precio)}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        {TIPO_VENTA_LABELS[p.tipoVenta as TipoVenta]}
                      </span>
                    </span>
                  )}
                </td>

                {/* Etiquetas */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(p.etiquetas ?? []).length > 0
                      ? (p.etiquetas ?? []).map((slug) => (
                          <EtiquetaBadge key={slug} slug={slug} />
                        ))
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </div>
                </td>

                {/* Toggle */}
                <td className="px-4 py-3 text-center">
                  <label className="toggle" title={p.activo ? 'Pausar' : 'Activar'}>
                    <input type="checkbox" checked={p.activo}
                      onChange={() => toggleActivo(p.id, p.activo)}
                      disabled={isPending} />
                    <span className="toggle-track"><span className="toggle-thumb" /></span>
                  </label>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/admin/productos/${p.id}/editar`}
                      className="btn-secondary px-3 py-1.5 text-xs">
                      ✏️ Editar
                    </a>
                    <button
                      onClick={() => eliminarProducto(p.id, p.nombre)}
                      className="btn-danger px-3 py-1.5 text-xs">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
