'use client';

import Image from 'next/image';
import { Producto, Categoria, TipoVenta } from '@prisma/client';
import { CATEGORIA_LABELS, formatPrecio } from '@/lib/constants';

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { nombre, descripcion, precio, tipoVenta, categoria, imagenUrl } = producto;

  const isPeso = tipoVenta === 'PESO';

  return (
    <article className="card group flex flex-col animate-fade-in">
      {/* Image */}
      <div className="relative aspect-square bg-cream-100 overflow-hidden">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl select-none">🍗</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-2 left-2 badge-orange shadow-sm">
          {CATEGORIA_LABELS[categoria]}
        </span>

        {/* Sale type indicator */}
        <span
          className={`absolute top-2 right-2 badge shadow-sm ${
            isPeso ? 'badge-blue' : 'badge-green'
          }`}
          title={isPeso ? 'Se vende por kilogramo' : 'Se vende por unidad'}
        >
          {isPeso ? '⚖️ x Kg' : '📦 x Un.'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <h3 className="font-display font-semibold text-gray-900 text-base leading-tight line-clamp-2">
          {nombre}
        </h3>

        {descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {descripcion}
          </p>
        )}

        <div className="mt-auto pt-2">
          <p
            className={`text-lg font-bold ${
              isPeso ? 'text-blue-600' : 'text-brand-600'
            }`}
          >
            {formatPrecio(precio, tipoVenta as TipoVenta)}
          </p>
          {isPeso && (
            <p className="text-[10px] text-gray-400 mt-0.5">Precio por kilogramo</p>
          )}
        </div>
      </div>
    </article>
  );
}
