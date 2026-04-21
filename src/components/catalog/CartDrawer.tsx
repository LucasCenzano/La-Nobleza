'use client';
import { useCart, calculateItemTotal, CartItem } from './CartContext';
import Image from 'next/image';
import { useLongPressQuantity } from '@/hooks/useLongPressQuantity';

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

  const isPeso = item.tipoVenta === 'PESO';
  const longPressPlus = useLongPressQuantity(increment);
  const longPressMinus = useLongPressQuantity(decrement);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      <button 
        {...longPressMinus}
        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 active:scale-95 transition-all"
      >-</button>
      <span className="text-[13px] font-bold w-[52px] text-center shrink-0">
        {isPeso 
          ? (item.cantidad < 1 ? `${Math.round(item.cantidad * 1000)}gr` : `${item.cantidad.toFixed(3).replace(/\.?0+$/, '') || '0'}kg`) 
          : item.cantidad}
      </span>
      <button 
        {...longPressPlus}
        disabled={item.stock !== null && item.stock !== undefined && item.cantidad >= item.stock}
        className={`w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm transition-all ${
          item.stock !== null && item.stock !== undefined && item.cantidad >= item.stock
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 active:scale-95'
        }`}
      >+</button>
    </div>
  );
}

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeItem, totalPrice } = useCart();

  if (!isCartOpen) return null;

  const handleWhatsApp = () => {
    let text = '*¡Hola La Nobleza!* 👋\nQuiero hacer el siguiente pedido:\n\n';
    
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
    text += 'Avisame por favor cuándo lo puedo pasar a buscar. ¡Gracias!';

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
        <div className="flex-1 overflow-y-auto p-5 pb-24 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
