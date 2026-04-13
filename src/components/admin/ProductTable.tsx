'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Producto } from '@prisma/client';
import { CATEGORIA_LABELS, TIPO_VENTA_LABELS, formatPrecio } from '@/lib/constants';
import { TipoVenta } from '@prisma/client';
import Image from 'next/image';

interface ProductTableProps {
  productos: Producto[];
}

export default function ProductTable({ productos }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggleActivo(id: string, currentValue: boolean) {
    await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !currentValue }),
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
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Activo</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {productos.map((p) => (
            <tr
              key={p.id}
              className={`transition-colors duration-150 ${
                !p.activo ? 'opacity-50 bg-gray-50' : 'hover:bg-cream-50'
              }`}
            >
              {/* Name + thumbnail */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.imagenUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100">
                      <Image
                        src={p.imagenUrl}
                        alt={p.nombre}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="40px"
                      />
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
                <span className="badge-orange">{CATEGORIA_LABELS[p.categoria]}</span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 font-semibold text-brand-700 whitespace-nowrap">
                {formatPrecio(p.precio, p.tipoVenta as TipoVenta)}
              </td>

              {/* Toggle switch */}
              <td className="px-4 py-3 text-center">
                <label
                  className="toggle"
                  title={p.activo ? 'Pausar producto' : 'Activar producto'}
                  aria-label={`${p.activo ? 'Pausar' : 'Activar'} ${p.nombre}`}
                >
                  <input
                    type="checkbox"
                    checked={p.activo}
                    onChange={() => toggleActivo(p.id, p.activo)}
                    disabled={isPending}
                  />
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                </label>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={`/admin/productos/${p.id}/editar`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    ✏️ Editar
                  </a>
                  <button
                    onClick={() => eliminarProducto(p.id, p.nombre)}
                    className="btn-danger px-3 py-1.5 text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
