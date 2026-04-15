'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Producto, TipoVenta } from '@prisma/client';
import { formatPrecio, formatPrecioSolo, CategoriaConfigType } from '@/lib/constants';
import { useCart } from './CartContext';

interface ProductCardProps {
  producto: Producto & { imagenesUrls?: string[]; etiquetas?: string[] };
  categorias?: CategoriaConfigType[];
}

const CAT_BG: Record<string, string> = {
  POLLERIA:              '#fdf9f3',
  PESCADERIA:            '#fdf9f3',
  PASTAS:                '#fdf9f3',
  COMIDAS_PREPARADAS:    '#fdf9f3',
  CONGELADOS:            '#fdf9f3',
  ALMACEN:               '#fdf9f3',
  IMPORTADOS_ESPECIALES: '#fdf9f3',
  ESPECIAS:              '#fdf9f3',
  OFERTAS:               '#fef2f2',
  OTROS:                 '#fdf9f3',
};

export default function ProductCard({ producto, categorias }: ProductCardProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    nombre, descripcion, precio, precioOferta,
    tipoVenta, categoria, imagenUrl, imagenesUrls, etiquetas, stock, incrementoPeso,
    solicitaInstrucciones, opcionesTitulo, opcionesValores
  } = producto as any;

  const isPeso        = tipoVenta === 'PESO';
  const parsedStep    = isPeso ? (incrementoPeso || 0.100) : 1;
  
  const initialQuantity = (() => {
    if (!isPeso) return 1;
    let fallback = 1;
    if (stock !== null && stock !== undefined && fallback > stock) {
      fallback = Math.max(stock, parsedStep);
    }
    return fallback;
  })();
  
  const precioFinal   = precioOferta && precioOferta > 0 ? precioOferta : precio;
  const [quantity, setQuantity] = useState(initialQuantity);
  const allImages     = (imagenesUrls?.length ? imagenesUrls : (imagenUrl ? [imagenUrl] : [])) as string[];
  const cardImage     = allImages[0];
  const detailImage   = allImages[currentImageIndex] || cardImage;
  const [instrucciones, setInstrucciones] = useState('');
  
  const hasOferta     = !!precioOferta && precioOferta > 0 && precioOferta < precio;
  const descuento     = hasOferta ? Math.round((1 - precioOferta / precio) * 100) : 0;
  const catBg         = CAT_BG[categoria as string] ?? CAT_BG.OTROS;
  const etiquetasList = (etiquetas as string[]) ?? [];
  const hasOfertaTag  = etiquetasList.includes('OFERTA') || hasOferta;

  // Auto deslizador de imágenes en el detalle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDetailOpen && allImages.length > 1 && !isGalleryOpen) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDetailOpen, allImages.length, isGalleryOpen]);

  // Al cerrar, reiniciar el índice
  useEffect(() => {
    if (!isDetailOpen) {
      setCurrentImageIndex(0);
      setInstrucciones('');
    }
  }, [isDetailOpen]);

  return (
    <>
      <article 
        onClick={() => setIsDetailOpen(true)}
        className="card-product flex flex-col h-full active:scale-[0.98] transition-transform cursor-pointer"
      >
        {/* ── Product Image ── */}
        <div
          className="relative overflow-hidden w-full flex items-center justify-center"
          style={{ aspectRatio: '1 / 1', backgroundColor: catBg }}
        >
          {cardImage ? (
            <Image
              src={cardImage}
              alt={nombre}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105 pointer-events-none"
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
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10 pointer-events-none">
            {hasOfertaTag && descuento > 0 && (
              <div className="bg-[var(--accent-orange)] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                -{descuento}%
              </div>
            )}
            {etiquetasList.filter(t => t !== 'OFERTA').map(tag => {
              if (tag === 'NUEVO') return <div key={tag} className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">NUEVO</div>;
              if (tag === 'DESTACADO') return <div key={tag} className="bg-[var(--gold-main)] text-white text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-md shadow-sm">★ Destacado</div>;
              return <div key={tag} className="bg-gray-800 text-white text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-md shadow-sm">{tag}</div>;
            })}
          </div>
        </div>

        {/* ── Card Content ── */}
        <div className="flex flex-col gap-1 p-3 flex-1 bg-white">
          {/* Product name */}
          <h3 className="font-sans font-semibold text-[13px] leading-snug line-clamp-2 text-[var(--black-charcoal)]">
            {nombre}
          </h3>

          {/* ── Price block ── */}
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
          </div>
          {descripcion && (
            <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 leading-tight font-medium">
              {descripcion}
            </p>
          )}
        </div>
      </article>

      {/* ── Detail Drawer Modal (z-index 100 covers BottomNav) ── */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailOpen(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md max-h-[95vh] sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up">
            
            {/* Header del modal (botón cerrar y drag pill) */}
            <div className="absolute top-0 w-full z-10 flex flex-col items-center pt-3 pb-2 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
              <div className="w-12 h-1.5 bg-white/60 rounded-full mb-2 sm:hidden"></div>
            </div>
            
            <button 
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="overflow-y-auto w-full pb-safe">
              {/* Imagen destacada en el detalle */}
              <div 
                className="w-full relative cursor-magnify overflow-hidden"
                style={{ aspectRatio: '1 / 1', backgroundColor: catBg }}
                onClick={() => {
                  if (allImages.length > 0) setIsGalleryOpen(true);
                }}
              >
                {detailImage ? (
                  <>
                    <Image
                      key={currentImageIndex} // force re-render for clean swapping
                      src={detailImage}
                      alt={nombre}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover transition-opacity duration-300 animate-fade-in"
                    />
                    
                    {allImages.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur text-gray-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1.5 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7.04 12 12 20.71 7.04"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                    
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 pointer-events-none">
                        {allImages.map((_, idx) => (
                           <div 
                             key={idx} 
                             className={`h-1.5 rounded-full transition-all duration-300 ${
                               idx === currentImageIndex ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-400'
                             }`} 
                           />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                )}
                
                {hasOfertaTag && descuento > 0 && (
                  <div className="absolute top-4 left-4 bg-[var(--accent-orange)] text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md z-10">
                    -{descuento}% OFF
                  </div>
                )}
              </div>

              {/* Información del detalle */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h2 className="font-sans font-bold text-xl text-[var(--black-charcoal)] leading-tight mb-2">
                    {nombre}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {etiquetasList.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precios (Detalle) */}
                <div className="flex flex-col border-y border-gray-100 py-4 my-1">
                  {hasOferta ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xl line-through text-gray-400 font-medium tracking-tight">
                        {formatPrecioSolo(precio)}
                      </span>
                      <span className="font-bold text-3xl text-[var(--accent-orange)] leading-none tracking-tight">
                        {formatPrecio(precioOferta, tipoVenta as TipoVenta)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-3xl text-[var(--black-charcoal)] leading-none tracking-tight">
                      {formatPrecio(precio, tipoVenta as TipoVenta)}
                    </span>
                  )}
                  {isPeso && (
                    <span className="text-[13px] text-gray-500 mt-1.5 font-medium">
                      Precio calculado por Kilogramo
                    </span>
                  )}
                  {!isPeso && (
                    <span className="text-[13px] text-gray-500 mt-1.5 font-medium">
                      Precio calculado por Unidad
                    </span>
                  )}
                </div>

                {descripcion && (
                  <div className="text-sm text-gray-600 leading-relaxed pb-4">
                    <p className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Descripción</p>
                    {descripcion}
                  </div>
                )}
              </div>

              {/* Opciones Especiales */}
              {solicitaInstrucciones && (
                <div className="px-5 pb-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    {opcionesValores && opcionesValores.length > 0 ? (
                      <>
                        <label className="block text-sm font-bold text-emerald-800 mb-2">
                          {opcionesTitulo || 'Opciones de Preparación'}
                        </label>
                        <select 
                          value={instrucciones}
                          onChange={(e) => setInstrucciones(e.target.value)}
                          className="w-full bg-white border border-emerald-200 text-emerald-900 text-[16px] sm:text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                        >
                          <option value="">(Sin especificar)</option>
                          {opcionesValores.map((opcion: string, i: number) => (
                            <option key={i} value={opcion}>{opcion}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-bold text-emerald-800 mb-2">
                          {opcionesTitulo || 'Instrucciones Especiales'}
                        </label>
                        <input 
                          type="text"
                          value={instrucciones}
                          onChange={(e) => setInstrucciones(e.target.value)}
                          maxLength={100}
                          placeholder="Ej: Sin menudos..."
                          className="w-full bg-white border border-emerald-200 text-emerald-900 text-[16px] sm:text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-emerald-300 shadow-sm"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer para Peso Variable */}
            {isPeso && (
              <div className="px-4 pb-3 bg-white">
                <div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 leading-tight flex items-start gap-2 border border-amber-100">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>
                    <strong>Nota:</strong> Los cortes son manuales y el peso (y su precio) puede variar levemente. Se ajustará al pesar el producto real.
                  </span>
                </div>
              </div>
            )}

            {/* Fila Pegajosa Inferior - Agregar al Carrito */}
            <div className="border-t border-gray-100 bg-white p-4 pb-safe flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity((q: number) => {
                    const next = Math.round((q - parsedStep) * 1000) / 1000;
                    return next < parsedStep ? parsedStep : next;
                  })}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:bg-gray-200 transition-colors shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
                </button>
                <div className="w-14 text-center">
                  <span className="font-bold text-[18px] text-[var(--black-charcoal)] leading-none">
                    {isPeso ? (quantity < 1 ? Math.round(quantity * 1000) : quantity.toFixed(3).replace(/\.?0+$/, '') || '0') : quantity}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium ml-0.5 block">{isPeso ? (quantity < 1 ? 'gr' : 'kg') : 'un.'}</span>
                </div>
                <button 
                  onClick={() => setQuantity((q: number) => {
                    const next = Math.round((q + parsedStep) * 1000) / 1000;
                    if (stock !== null && stock !== undefined && next > stock) return Math.max(stock, parsedStep);
                    return next;
                  })}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:bg-gray-200 transition-colors shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>

              <button 
                onClick={() => {
                  addItem({
                    productoId: producto.id,
                    nombre,
                    precioFinal,
                    tipoVenta,
                    cantidad: quantity,
                    imagenUrl: cardImage,
                    incrementoPeso,
                    stock,
                    instrucciones: instrucciones.trim() || undefined
                  });
                  setIsDetailOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex-1 ml-4 bg-[var(--black-charcoal)] text-white font-bold h-12 rounded-[1rem] flex items-center justify-center gap-2 shadow-xl shadow-black/20 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Agregar
                <span className="opacity-80 font-normal">|</span>
                ${(precioFinal * quantity).toLocaleString('es-AR')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Image Gallery Modal (z-index 110) ── */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-fade-in touch-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 z-10 w-full absolute top-0 bg-gradient-to-b from-black/60 to-transparent">
            {allImages.length > 1 ? (
              <span className="text-white/80 font-bold tracking-widest text-sm drop-shadow-md">
                DESLIZAR <span className="opacity-50 text-xs ml-1">→</span>
              </span>
            ) : <span />}
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 active:scale-95 transition-transform"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Swipeable Gallery Container */}
          <div className="flex-1 w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-x-hide">
            {allImages.map((img, i) => (
              <div 
                key={i} 
                className="min-w-full w-full h-full snap-center flex items-center justify-center p-2 relative"
              >
                <div className="relative w-full h-4/5 flex items-center justify-center">
                  <Image
                    src={img}
                    alt={`Imagen ${i+1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
