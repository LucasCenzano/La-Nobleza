'use client';

import { useState, useEffect } from 'react';


import { Producto, TipoVenta } from '@prisma/client';
import { formatPrecio, formatPrecioSolo, CategoriaConfigType } from '@/lib/constants';
import { useCart } from './CartContext';
import { useLongPressQuantity } from '@/hooks/useLongPressQuantity';

// ─── Framing helpers (mirrors ImageUploader logic) ─────────────────────────
interface ImageFraming { x: number; y: number; zoom: number; }

function parseFraming(rawUrl: string): { url: string; framing?: ImageFraming } {
  const hashIdx = rawUrl.indexOf('#framing:');
  if (hashIdx === -1) return { url: rawUrl };
  const url = rawUrl.slice(0, hashIdx);
  const parts = rawUrl.slice(hashIdx + 9).split(',').map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    return { url, framing: { x: parts[0], y: parts[1], zoom: parts[2] } };
  }
  return { url };
}

function framingStyle(framing?: ImageFraming): React.CSSProperties {
  if (!framing) return {};
  return {
    objectPosition: `${framing.x}% ${framing.y}%`,
    transform: framing.zoom !== 1 ? `scale(${framing.zoom})` : undefined,
    transformOrigin: `${framing.x}% ${framing.y}%`,
  };
}

interface ProductCardProps {
  producto: Producto & { imagenesUrls?: string[]; etiquetas?: string[] };
  categorias?: CategoriaConfigType[];
  animationIndex?: number;
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

/* ── Badge visual config ── */
const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  NUEVO:     { bg: '#22c55e', text: '#ffffff', label: 'NUEVO' },
  DESTACADO: { bg: 'rgba(212,175,55,0.15)', text: '#92400e', label: '★ Destacado' },
};

export default function ProductCard({ producto, categorias, animationIndex = 0 }: ProductCardProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ripple, setRipple] = useState<{x: number; y: number} | null>(null);

  function handleCardTap(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 500);
    setIsDetailOpen(true);
  }

  const {
    nombre, descripcion, precio, precioOferta,
    tipoVenta, categoria, imagenUrl, imagenesUrls, etiquetas, stock, incrementoPeso,
    solicitaInstrucciones, opcionesTitulo, opcionesValores, promoPersonalizada,
    promoCantidadRequerida, promoPrecioTotal, pesoEstimado
  } = producto as any;

  const isPeso        = tipoVenta === 'PESO';
  const parsedStep    = isPeso ? (incrementoPeso || 0.100) : 1;
  
  const initialQuantity = (() => {
    const step = isPeso ? (incrementoPeso || 0.100) : 1;
    let fallback = isPeso ? 1 : 1;
    if (stock !== null && stock !== undefined) {
      if (fallback > stock) {
        fallback = stock;
      }
    }
    return fallback;
  })();
  
  const precioFinal   = Math.round(precioOferta && precioOferta > 0 ? precioOferta : precio);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Calcula el total del item aplicando la promo si corresponde (mismo algoritmo que calculateItemTotal)
  function calcPromoTotal(qty: number): { total: number; promoActiva: boolean } {
    const basePrice = precioFinal;
    if (promoCantidadRequerida && promoPrecioTotal) {
      const qtyR = Math.round(qty * 1000) / 1000;
      const req  = Number(promoCantidadRequerida);
      if (qtyR >= req) {
        const combos = Math.floor(qtyR / req);
        const resto  = Math.round((qtyR - combos * req) * 1000) / 1000;
        const total  = Math.round(combos * Number(promoPrecioTotal) + resto * basePrice);
        return { total, promoActiva: true };
      }
    }
    return { total: Math.round(basePrice * qty), promoActiva: false };
  }

  const allImagesRaw = (imagenesUrls?.length ? imagenesUrls : (imagenUrl ? [imagenUrl] : [])) as string[];
  // Parse framing from URL fragments
  const allImages = allImagesRaw.map((raw) => {
    const { url, framing } = parseFraming(raw);
    return { url, framing };
  });
  const cardImage = allImages[0]?.url || null;
  const cardFraming = allImages[0]?.framing;
  const detailImageData = allImages[currentImageIndex] || allImages[0];
  const detailImage = detailImageData?.url || null;
  const detailFraming = detailImageData?.framing;
  const [instrucciones, setInstrucciones] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  
  const hasOferta     = !!precioOferta && precioOferta > 0 && precioOferta < precio;
  const descuento     = hasOferta ? Math.round((1 - precioOferta / precio) * 100) : 0;
  const catBg         = CAT_BG[categoria as string] ?? CAT_BG.OTROS;
  const etiquetasList = (etiquetas as string[]) ?? [];
  const hasOfertaTag  = etiquetasList.includes('OFERTA') || hasOferta;

  // Pick top badge to display on card (priority: NUEVO > DESTACADO), only when no discount shown
  const visibleBadge = (!hasOfertaTag || descuento === 0)
    ? etiquetasList.find((t) => BADGE_STYLES[t]) || null
    : null;

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

  // ─── Handlers para cantidad con Long Press ───
  const increment = () => {
    setQuantity((q: number) => {
      const next = Math.round((q + parsedStep) * 1000) / 1000;
      if (stock !== null && stock !== undefined && next > stock) return stock;
      return next;
    });
  };

  const decrement = () => {
    setQuantity((q: number) => {
      const next = Math.round((q - parsedStep) * 1000) / 1000;
      return next < parsedStep ? parsedStep : next;
    });
  };

  const longPressPlus = useLongPressQuantity(increment);
  const longPressMinus = useLongPressQuantity(decrement);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
           PRODUCT CARD (Grid Item)
         ═══════════════════════════════════════════════════════════ */}
      <article 
        onClick={handleCardTap}
        className="card-product group flex flex-col h-full cursor-pointer animate-stagger-slide-up"
        style={{ animationDelay: `${Math.min(animationIndex * 40, 700)}ms` }}
      >
        {/* ── Product Image ── */}
        <div
          className="card-product__image relative overflow-hidden w-full flex items-center justify-center"
          style={{ aspectRatio: '4 / 3', backgroundColor: catBg }}
        >
          {cardImage ? (
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardImage}
                alt={nombre}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[450ms] ease-out group-hover:scale-[1.06] pointer-events-none"
                style={framingStyle(cardFraming)}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-25">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span className="text-[9px] mt-1.5 font-medium text-gray-400 tracking-wide uppercase">Sin imagen</span>
            </div>
          )}

          {/* ── Badges stack (top-left) ── */}
          <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
            {/* Discount badge */}
            {hasOfertaTag && descuento > 0 && (
              <div className="card-product__badge-discount animate-float-badge">
                -{descuento}%
              </div>
            )}
            {/* Tag badge (NUEVO / DESTACADO) — shown only when no discount */}
            {visibleBadge && BADGE_STYLES[visibleBadge] && (
              <div
                className={`text-[10px] font-bold tracking-wider px-2.5 py-1 z-10 shadow-sm ${
                  visibleBadge === 'NUEVO' ? 'rounded-full' : 'rounded-lg'
                }`}
                style={{
                  backgroundColor: BADGE_STYLES[visibleBadge].bg,
                  color: BADGE_STYLES[visibleBadge].text,
                }}
              >
                {BADGE_STYLES[visibleBadge].label}
              </div>
            )}
            {/* All other custom tags */}
            {etiquetasList.filter(t => t !== 'OFERTA' && !BADGE_STYLES[t]).map(tag => (
              <div key={tag} className="card-product__badge-tag" style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#374151' }}>
                {tag}
              </div>
            ))}
            
            {/* Out of stock badge */}
            {stock !== null && stock !== undefined && stock <= 0 && (
              <div className="card-product__badge-tag" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                AGOTADO
              </div>
            )}
          </div>

          {/* Ripple effect on tap */}
          {ripple && (
            <span
              className="pointer-events-none absolute rounded-full bg-black/10"
              style={{
                width: 120, height: 120,
                top: ripple.y - 60, left: ripple.x - 60,
                animation: 'ripple 0.5s ease-out forwards',
              }}
            />
          )}
        </div>

        {/* ── Card Content ── */}
        <div className="flex flex-col gap-0.5 px-3 pt-2.5 pb-3 sm:px-3.5 sm:pt-3 sm:pb-3.5 flex-1 bg-white">
          {/* Product name */}
          <h3 className="font-sans font-semibold text-sm leading-snug line-clamp-1 text-[var(--black-charcoal)]">
            {nombre}
          </h3>

          {/* Promo badge */}
          {promoPersonalizada && (
            <div className="card-product__promo mt-1">
              🔥 {promoPersonalizada}
            </div>
          )}

          {/* ── Price and Add block (pushed to bottom) ── */}
          <div className="mt-auto flex items-center justify-between pt-3 gap-2">
            <div className="flex flex-col min-w-0">
              {hasOferta ? (
                <>
                  <span className="text-[10px] line-through text-gray-400 font-medium leading-none mb-1">
                    {formatPrecioSolo(precio)}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-bold text-lg sm:text-xl text-[#dc2626] leading-none tracking-tight">
                      {formatPrecioSolo(precioOferta)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-normal">
                      {isPeso ? '/kg' : '/un'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-0.5">
                  <span className="font-bold text-lg sm:text-xl text-[var(--black-charcoal)] leading-none tracking-tight">
                    {formatPrecioSolo(precio)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-normal">
                    {isPeso ? '/kg' : '/un'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick-add button - Larger touch target and functional */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (solicitaInstrucciones) {
                  setIsDetailOpen(true);
                } else {
                  addItem({
                    productoId: producto.id,
                    nombre,
                    precioFinal,
                    tipoVenta,
                    cantidad: initialQuantity,
                    imagenUrl: cardImage,
                    incrementoPeso,
                    stock,
                    promoCantidadRequerida,
                    promoPrecioTotal
                  });
                  
                  // --- Salto al Carrito (Efecto Parábola) ---
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const cartBtn = document.getElementById('bottom-nav-cart');
                  const cartRect = cartBtn?.getBoundingClientRect();

                  if (cartRect) {
                    const projectile = document.createElement('div');
                    projectile.className = 'fixed z-[100] w-10 h-10 rounded-full border-2 border-white shadow-xl pointer-events-none overflow-hidden bg-white';
                    projectile.style.left = `${rect.left}px`;
                    projectile.style.top = `${rect.top}px`;
                    projectile.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    
                    if (cardImage) {
                      projectile.innerHTML = `<img src="${cardImage}" style="width: 100%; height: 100%; object-fit: cover;" />`;
                    } else {
                      projectile.style.backgroundColor = 'var(--gold-main)';
                    }

                    document.body.appendChild(projectile);
                    projectile.getBoundingClientRect(); // Reflow

                    const targetX = cartRect.left + cartRect.width / 2 - 20;
                    const targetY = cartRect.top - 10;

                    projectile.style.transform = `translate(${targetX - rect.left}px, ${targetY - rect.top}px) scale(0.3)`;
                    projectile.style.opacity = '0.7';

                    setTimeout(() => {
                      projectile.remove();
                      window.dispatchEvent(new CustomEvent('cart-added'));
                    }, 800);
                  }
                }
              }}
              className="card-quick-add flex w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--black-charcoal)] items-center justify-center transition-all duration-200 shadow-xl shadow-black/10 shrink-0 active:scale-90 border-2 border-white/5"
              aria-label="Agregar al carrito"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      </article>

      {/* ═══════════════════════════════════════════════════════════
           DETAIL DRAWER MODAL (z-index 100 covers BottomNav)
         ═══════════════════════════════════════════════════════════ */}
      {isDetailOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailOpen(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md max-h-[95vh] sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up sm:animate-pop-in">
            
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
                    <div className="absolute inset-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={currentImageIndex}
                        src={detailImage}
                        alt={nombre}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 animate-fade-in pointer-events-none"
                        style={framingStyle(detailFraming)}
                      />
                    </div>
                    
                    {/* Pagination dots (friendly indicator) */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 pointer-events-none">
                        {allImages.map((_: { url: string; framing?: ImageFraming }, idx: number) => (
                           <div 
                             key={idx} 
                             className={`h-1.5 rounded-full transition-all duration-300 ${
                               idx === currentImageIndex ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/50'
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
                  <div className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-md z-10"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  >
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
                  
                  {promoPersonalizada && (
                    <div className="mb-3 flex items-center gap-2 text-[12px] font-black px-3 py-1.5 rounded-lg tracking-wide w-fit shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #fef3c7, #fcd34d)',
                        color: '#92400e',
                        border: '1.5px solid #f59e0b',
                      }}
                    >
                      🔥 <span className="uppercase">{promoPersonalizada}</span>
                    </div>
                  )}

                  {/* Detail tag pills */}
                  <div className="flex flex-wrap gap-2">
                    {etiquetasList.map((tag: string) => {
                      const style = BADGE_STYLES[tag];
                      return (
                        <span
                          key={tag}
                          className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg"
                          style={{
                            backgroundColor: style?.bg || 'rgba(0,0,0,0.04)',
                            color: style?.text || '#6b7280',
                          }}
                        >
                          {style?.label || tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Precios (Detalle) */}
                <div className="flex flex-col border-y border-gray-100 py-4 my-1">
                  {hasOferta ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xl line-through text-gray-400 font-medium tracking-tight">
                        {formatPrecioSolo(precio)}
                      </span>
                      <span className="font-bold text-3xl text-[#dc2626] leading-none tracking-tight">
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
                  {!isPeso && pesoEstimado && pesoEstimado > 0 && (
                    <span className="text-[12px] text-blue-600 mt-1 font-semibold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                      Peso aprox. por unidad: {pesoEstimado}kg
                    </span>
                  )}

                  {/* ── Promo status indicator ── */}
                  {promoCantidadRequerida && promoPrecioTotal && (() => {
                    const req  = Number(promoCantidadRequerida);
                    const qtyR = Math.round(quantity * 1000) / 1000;
                    const { promoActiva } = calcPromoTotal(quantity);
                    const faltan = Math.round((req - qtyR) * 1000) / 1000;
                    const unidad = isPeso ? 'kg' : 'un.';

                    if (promoActiva) {
                      return (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-black animate-fade-in shadow-md"
                          style={{ background: 'linear-gradient(135deg, #fef3c7, #fbbf24)', color: '#92400e', border: '1.5px solid #f59e0b' }}>
                          <span className="text-base">🔥</span>
                          <span>¡Combo aplicado! ${Number(promoPrecioTotal).toLocaleString('es-AR')} por {req}{unidad}</span>
                        </div>
                      );
                    }
                    return (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: '#fff7ed', color: '#ea580c', border: '1.5px dashed #fdba74' }}>
                        <span className="text-base">💡</span>
                        <span>Llevando {faltan > 0 ? `${faltan} ${unidad} más` : `${req}${unidad}`} pagás solo <strong>${Number(promoPrecioTotal).toLocaleString('es-AR')}</strong></span>
                      </div>
                    );
                  })()}
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
                  {...longPressMinus}
                  className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-black active:bg-gray-300 transition-colors shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                </button>
                <div className="w-14 text-center">
                  <span className="font-bold text-[18px] text-[var(--black-charcoal)] leading-none">
                    {isPeso ? (quantity < 1 ? Math.round(quantity * 1000) : quantity.toFixed(3).replace(/\.?0+$/, '') || '0') : quantity}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium ml-0.5 block">{isPeso ? (quantity < 1 ? 'gr' : 'kg') : 'un.'}</span>
                </div>
                <button 
                  {...longPressPlus}
                  disabled={stock !== null && stock !== undefined && quantity >= stock}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                    stock !== null && stock !== undefined && quantity >= stock 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-gray-200 text-black active:bg-gray-300'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
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
                    instrucciones: instrucciones.trim() || undefined,
                    promoCantidadRequerida,
                    promoPrecioTotal
                  });
                  
                  // Feedback de éxito
                  setIsAdded(true);
                  setTimeout(() => {
                    setIsAdded(false);
                    setIsDetailOpen(false);
                    setIsCartOpen(true);
                  }, 1500);
                }}
                disabled={isAdded || (stock !== null && stock !== undefined && stock <= 0)}
                className={`flex-1 ml-4 text-white font-bold h-12 rounded-[1rem] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all whitespace-nowrap duration-300 ${
                  isAdded
                    ? 'bg-[#25D366] shadow-[#25D366]/30'
                    : stock !== null && stock !== undefined && stock <= 0
                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[var(--black-charcoal)] shadow-black/20'
                }`}
              >
                {isAdded ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>¡Listo!</span>
                  </div>
                ) : (
                  stock !== null && stock !== undefined && stock <= 0 ? (
                    'Sin Stock'
                  ) : (
                    (() => {
                      const { total, promoActiva } = calcPromoTotal(quantity);
                      return (
                        <>
                          {promoActiva && <span className="text-[11px] opacity-80">🔥</span>}
                          Agregar
                          <span className="opacity-80 font-normal">|</span>
                          ${total.toLocaleString('es-AR')}
                        </>
                      );
                    })()
                  )
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           FULLSCREEN IMAGE GALLERY MODAL (z-index 110)
         ═══════════════════════════════════════════════════════════ */}
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
            {allImages.map((img: { url: string; framing?: ImageFraming }, i: number) => (
              <div 
                key={i} 
                className="min-w-full w-full h-full snap-center flex items-center justify-center p-2 relative"
              >
              <div className="relative w-full h-4/5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Imagen ${i+1}`}
                  className="w-full h-full object-contain"
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
