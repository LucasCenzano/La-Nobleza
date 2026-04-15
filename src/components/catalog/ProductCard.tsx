'use client';

import Image from 'next/image';
import { Producto, TipoVenta } from '@prisma/client';
import { formatPrecio, formatPrecioSolo, getCategoriaLabel, CategoriaConfigType } from '@/lib/constants';

interface ProductCardProps {
  producto: Producto & { imagenesUrls?: string[]; etiquetas?: string[] };
  categorias?: CategoriaConfigType[];
}

const CAT_BG: Record<string, string> = {
  POLLO_ENTERO: '#fdf9f3',
  PRESAS:       '#fdf9f3',
  ALITAS:       '#fdf9f3',
  MENUDENCIAS:  '#fdf9f3',
  EMBUTIDOS:    '#fdf9f3',
  HUEVOS:       '#fdf9f3',
  CARNICERIA:   '#fdf9f3',
  PESCADO:      '#fdf9f3',
  PASTAS:       '#fdf9f3',
  ALMACEN:      '#fdf9f3',
  LACTEOS:      '#fdf9f3',
  PANADERIA:    '#fdf9f3',
  OFERTAS:      '#fef2f2',
  OTROS:        '#fdf9f3',
};

export default function ProductCard({ producto, categorias }: ProductCardProps) {
  const {
    nombre, descripcion, precio, precioOferta,
    tipoVenta, categoria, imagenUrl, imagenesUrls, etiquetas,
  } = producto as any;

  const isPeso        = tipoVenta === 'PESO';
  const displayImage  = imagenesUrls?.[0] || imagenUrl;
  const hasOferta     = !!precioOferta && precioOferta > 0 && precioOferta < precio;
  const descuento     = hasOferta ? Math.round((1 - precioOferta / precio) * 100) : 0;
  const catBg         = CAT_BG[categoria as string] ?? CAT_BG.OTROS;
  const etiquetasList = (etiquetas as string[]) ?? [];
  const hasOfertaTag  = etiquetasList.includes('OFERTA') || hasOferta;

  return (
    <article className="card-product flex flex-col h-full active:scale-[0.98] transition-transform cursor-pointer">
      {/* ── Product Image ── */}
      <div
        className="relative overflow-hidden w-full flex items-center justify-center p-3"
        style={{ aspectRatio: '1 / 1', backgroundColor: catBg }}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={nombre}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}

        {/* ── Badges ── */}
        {hasOfertaTag && descuento > 0 && (
          <div className="absolute top-2 left-2 bg-[var(--accent-orange)] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
            -{descuento}%
          </div>
        )}
      </div>

      {/* ── Card Content ── */}
      <div className="flex flex-col gap-1 p-3 flex-1 bg-white">
        {/* Product name */}
        <h3 className="font-sans font-semibold text-[13px] leading-snug line-clamp-2 text-[var(--black-charcoal)]">
          {nombre}
        </h3>

        {/* ── Price & Action block ── */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {hasOferta ? (
              <>
                <span className="text-[10px] line-through text-gray-400 font-medium">
                  {formatPrecioSolo(precio)}
                </span>
                <span className="font-bold text-[16px] text-[var(--accent-orange)] leading-none mt-0.5">
                  {formatPrecio(precioOferta, tipoVenta as TipoVenta)}
                </span>
              </>
            ) : (
              <>
                <span className="h-[15px]"></span> {/* spacer if no old price */}
                <span className="font-bold text-[16px] text-[var(--black-charcoal)] leading-none">
                  {formatPrecio(precio, tipoVenta as TipoVenta)}
                </span>
              </>
            )}
            {isPeso && (
              <span className="text-[9px] text-gray-400 mt-1 font-medium tracking-wide">
                /KG
              </span>
            )}
          </div>

          {/* ── Add Button (+) ── */}
          <a
            href={`https://wa.me/5493874000000?text=Hola!+Quiero+pedir:+${encodeURIComponent(nombre)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--black-charcoal)] text-white shadow-md active:bg-gray-800 transition-colors"
            aria-label={`Pedir ${nombre}`}
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '44px', minHeight: '44px' }} // Tappable area
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
