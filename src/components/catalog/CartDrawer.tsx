'use client';
import { useCart, calculateItemTotal, CartItem } from './CartContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLongPressQuantity } from '@/hooks/useLongPressQuantity';

const DEFAULT_INTRO  = '*¡Hola La Nobleza!* 👋\nQuiero hacer el siguiente pedido:\n\n';
const DEFAULT_CIERRE = 'Avisame por favor cuándo lo puedo pasar a buscar. ¡Gracias!';

function CartItemQuantity({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const step = item.tipoVenta === 'PESO' ? (item.incrementoPeso || 0.100) : 1;
  const isPeso = item.tipoVenta === 'PESO';

  const increment = () => {
    const next = Math.round((item.cantidad + step) * 1000) / 1000;
    if (item.stock !== null && item.stock !== undefined && next > item.stock) {
      updateQuantity(item.productoId, item.instrucciones, item.stock);
    } else {
      updateQuantity(item.productoId, item.instrucciones, next);
    }
  };

  const decrement = () => {
    const next = Math.round((item.cantidad - step) * 1000) / 1000;
    if (next >= (isPeso ? 0.001 : 1)) {
        updateQuantity(item.productoId, item.instrucciones, next);
    } else {
        removeItem(item.productoId, item.instrucciones);
    }
  };

  const longPressPlus = useLongPressQuantity(increment);
  const longPressMinus = useLongPressQuantity(decrement);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button 
        {...longPressMinus}
        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md shadow-sm text-black font-bold active:scale-95 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M5 12h14"/></svg>
      </button>
      <span className="text-[13px] font-bold w-[54px] text-center shrink-0">
        {isPeso 
          ? (item.cantidad < 1 ? `${Math.round(item.cantidad * 1000)}gr` : `${item.cantidad.toFixed(3).replace(/\.?0+$/, '') || '0'}kg`) 
          : item.cantidad}
      </span>
      <button 
        {...longPressPlus}
        disabled={item.stock !== null && item.stock !== undefined && item.cantidad >= item.stock}
        className={`w-8 h-8 flex items-center justify-center rounded-md shadow-sm transition-all ${
          item.stock !== null && item.stock !== undefined && item.cantidad >= item.stock
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'bg-gray-200 text-black font-bold active:scale-95'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeItem, totalPrice } = useCart();
  const [mensajeIntro,  setMensajeIntro]  = useState(DEFAULT_INTRO);
  const [mensajeCierre, setMensajeCierre] = useState(DEFAULT_CIERRE);

  useEffect(() => {
    fetch('/api/public/configuracion')
      .then((r) => r.json())
      .then((data) => {
        if (data.mensajeWhatsappIntro)  setMensajeIntro(data.mensajeWhatsappIntro);
        if (data.mensajeWhatsappCierre) setMensajeCierre(data.mensajeWhatsappCierre);
      })
      .catch(() => {}); // usa defaults si falla
  }, []);

  if (!isCartOpen) return null;

  const handleWhatsApp = () => {
    let text = mensajeIntro;
    
    items.forEach(item => {
      const isPeso = item.tipoVenta === 'PESO';
      let cantStr = `${item.cantidad}x`;
      if (isPeso) {
        cantStr = item.cantidad < 1 
          ? `${Math.round(item.cantidad * 1000)} gr` 
          : `${item.cantidad.toFixed(3).replace(/\.?0+$/, '') || '0'} Kg`;
      }
      const cant = cantStr;
      const sub = calculateItemTotal(item);
      const subOriginal = Math.round(item.cantidad * item.precioFinal);
      const hasCombo = sub < subOriginal;
      
      let line = `• ${cant} *${item.nombre}*`;
      if (item.instrucciones) line += `\n  _📌 Nota: ${item.instrucciones}_`;
      line += `\n  _Subtotal: $${sub.toLocaleString('es-AR')}_${hasCombo ? ' *(Combo Aplicado)*' : ''}\n`;
      text += line;
    });

    text += `\n*Total estimado:* $${totalPrice.toLocaleString('es-AR')}\n\n`;
    text += mensajeCierre;

    const url = `https://wa.me/5493875875560?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/60 sm:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
    >
      <div className="bg-white w-full sm:max-w-md mx-auto h-[90vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-2">
            🛒 Tu Pedido
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-40 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
              <span className="text-5xl opacity-40">🛍️</span>
              <p className="font-medium text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productoId + (item.instrucciones || '')} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                  {/* Imagen */}
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-100 relative overflow-hidden flex items-center justify-center text-2xl">
                    {item.imagenUrl ? (
                      <Image src={item.imagenUrl} alt={item.nombre} fill className="object-cover" />
                    ) : '🍳'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-[14px] truncate leading-tight mb-0.5">{item.nombre}</h3>
                    {item.instrucciones && (
                      <p className="text-[11px] text-gray-500 mb-1 flex items-start gap-1 leading-tight"><span className="text-[10px] mt-0.5">📌</span> {item.instrucciones}</p>
                    )}
                    {calculateItemTotal(item) < Math.round(item.precioFinal * item.cantidad) ? (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-[var(--accent-orange)] text-[15px] flex items-center gap-1">
                          <span className="text-[10px] mt-0.5">🔥</span> ${(calculateItemTotal(item)).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through">
                          ${Math.round(item.precioFinal * item.cantidad).toLocaleString('es-AR')}
                        </span>
                      </div>
                    ) : (
                      <p className="font-bold text-[var(--gold-dark)] text-sm mb-2">
                        ${(calculateItemTotal(item)).toLocaleString('es-AR')}
                      </p>
                    )}

                    {/* Controles cantidad */}
                    <div className="flex items-center gap-3">
                      <CartItemQuantity item={item} />
                      <button 
                        onClick={() => removeItem(item.productoId, item.instrucciones)}
                        className="text-red-500 p-1 bg-red-50 rounded-lg active:scale-90 ml-auto"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recomendaciones (Solo si hay productos cargados) */}
          {(() => {
            const { allProducts, addItem } = useCart();
            const recommendations = allProducts
              .filter(p => !items.some(i => i.productoId === p.id))
              .filter(p => p.etiquetas?.includes('DESTACADO') || p.etiquetas?.includes('OFERTA'))
              .slice(0, 8);

            if (recommendations.length === 0) return null;

            return (
              <div className="mt-10 mb-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4">
                  También te puede interesar
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-hide -mx-1 px-1">
                  {recommendations.map((p) => {
                    const price = p.precioOferta && p.precioOferta > 0 ? p.precioOferta : p.precio;
                    return (
                      <div 
                        key={p.id}
                        className="flex-shrink-0 w-32 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                          {p.imagenUrl ? (
                            <Image src={p.imagenUrl} alt={p.nombre} fill className="object-cover" />
                          ) : (
                            <span className="text-xl opacity-20">🥩</span>
                          )}
                          <button 
                            onClick={() => addItem({
                              productoId: p.id,
                              nombre: p.nombre,
                              precioFinal: price,
                              tipoVenta: p.tipoVenta,
                              cantidad: 1,
                              imagenUrl: p.imagenUrl,
                              incrementoPeso: p.incrementoPeso,
                              stock: p.stock,
                              promoCantidadRequerida: p.promoCantidadRequerida,
                              promoPrecioTotal: p.promoPrecioTotal
                            })}
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-[var(--black-charcoal)] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                        </div>
                        <div className="p-2 flex flex-col gap-0.5">
                          <p className="text-[11px] font-bold text-gray-800 line-clamp-1 leading-tight">{p.nombre}</p>
                          <p className="text-[12px] font-black text-[var(--gold-dark)]">${Math.round(price).toLocaleString('es-AR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Botón para agregar más productos */}
          {items.length > 0 && (
            <button 
              onClick={() => setIsCartOpen(false)}
              className="mt-6 mb-8 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-bold text-sm active:scale-95 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Seguir sumando productos
            </button>
          )}
        </div>

        {/* Footer flotante */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-gray-500 font-semibold">Total estimado</span>
              <span className="text-2xl font-bold text-[var(--black-charcoal)]">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-[1.25rem] font-bold text-[16px] shadow-lg shadow-[#25D366]/30 active:scale-[0.98] transition-all"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
