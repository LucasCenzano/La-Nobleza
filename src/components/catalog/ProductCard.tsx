'use client';

import Image from 'next/image';
import { Producto, TipoVenta } from '@prisma/client';
import { formatPrecio, formatPrecioSolo, getCategoriaLabel, ETIQUETA_MAP, CategoriaConfigType } from '@/lib/constants';
import EtiquetaBadge from '@/components/admin/EtiquetaBadge';

interface ProductCardProps {
  producto: Producto & { imagenesUrls?: string[]; etiquetas?: string[] };
  categorias?: CategoriaConfigType[];
}

export default function ProductCard({ producto, categorias }: ProductCardProps) {
  const {
    nombre, descripcion, precio, precioOferta,
    tipoVenta, categoria, imagenUrl, imagenesUrls, etiquetas,
  } = producto as any;

  const isPeso       = tipoVenta === 'PESO';
  const displayImage = imagenesUrls?.[0] || imagenUrl;
  const hasOferta    = !!precioOferta && precioOferta > 0 && precioOferta < precio;
  const descuento    = hasOferta
    ? Math.round((1 - precioOferta / precio) * 100)
    : 0;

  const catLabel = getCategoriaLabel(categoria, categorias);

  return (
    <article className="card group flex flex-col animate-fade-in">
      {/* Image */}
      <div className="relative aspect-square bg-cream-100 overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
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
        <span className="absolute top-2 left-2 badge-orange shadow-sm text-[10px]">
          {catLabel}
        </span>

        {/* Sale type indicator */}
        <span
          className={`absolute top-2 right-2 badge shadow-sm text-[10px] ${
            isPeso ? 'badge-blue' : 'badge-green'
          }`}
          title={isPeso ? 'Se vende por kilogramo' : 'Se vende por unidad'}
        >
          {isPeso ? '⚖️ x Kg' : '📦 x Un.'}
        </span>

        {/* Discount badge */}
        {hasOferta && descuento > 0 && (
          <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow">
            -{descuento}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        {/* Etiquetas */}
        {(etiquetas as string[])?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(etiquetas as string[]).map((slug) => (
              <EtiquetaBadge key={slug} slug={slug} />
            ))}
          </div>
        )}

        <h3 className="font-display font-semibold text-gray-900 text-base leading-tight line-clamp-2">
          {nombre}
        </h3>

        {descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {descripcion}
          </p>
        )}

        <div className="mt-auto pt-2">
          {hasOferta ? (
            <>
              <p className="text-xs text-gray-400 line-through leading-none">
                {formatPrecioSolo(precio)}
              </p>
              <p className="text-lg font-bold text-red-600 leading-tight">
                {formatPrecio(precioOferta, tipoVenta as TipoVenta)}
              </p>
            </>
          ) : (
            <p className={`text-lg font-bold ${isPeso ? 'text-blue-600' : 'text-brand-600'}`}>
              {formatPrecio(precio, tipoVenta as TipoVenta)}
            </p>
          )}
          {isPeso && (
            <p className="text-[10px] text-gray-400 mt-0.5">Precio por kilogramo</p>
          )}
        </div>
      </div>
    </article>
  );
}
