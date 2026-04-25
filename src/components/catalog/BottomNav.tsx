'use client';

import { useState, useEffect } from 'react';
import { useCart } from './CartContext';

const DIAS_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export default function BottomNav() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const [config, setConfig] = useState<any>(null);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const handleCartAdded = () => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 300);
    };
    window.addEventListener('cart-added', handleCartAdded);
    return () => window.removeEventListener('cart-added', handleCartAdded);
  }, []);

  useEffect(() => {
    fetch('/api/public/configuracion')
      .then(r => r.json())
      .then(data => setConfig(data))
      .catch(() => { });
  }, []);

  const renderHorarios = () => {
    if (!config?.horariosActivos || !config?.horarios) return null;
    const h = config.horarios;
    const activeDays = DIAS_KEYS.filter(key => h[key]?.activo);
    if (activeDays.length === 0) return null;

    return (
      <div className="mt-6 mb-2 py-4 border-y border-gray-100 bg-gray-50/30 -mx-6 px-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Horarios de Atención</p>
        <div className="space-y-2">
          {activeDays.map(key => {
            const d = h[key];
            return (
              <div key={key} className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-gray-700">{DIAS_LABELS[key]}</span>
                <div className="text-gray-500 font-medium">
                  {d.abre}–{d.cierra}{d.dobleTurno ? <span className="mx-1 text-gray-300">|</span> : ''}{d.dobleTurno ? `${d.abre2}–${d.cierra2}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Inicio */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          {/* Carrito */}
          <button 
            id="bottom-nav-cart"
            onClick={() => setIsCartOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full text-[#C5A059] relative transition-all duration-300 ${isBouncing ? 'scale-[1.2] -translate-y-1' : 'scale-100'}`}
          >
            <div className="relative">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span 
                  key={totalItems}
                  className={`absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ${totalItems === 1 ? 'animate-pop-in' : ''}`}
                >
                  <span className={totalItems > 1 ? 'animate-scroll-number' : ''}>
                    {totalItems}
                  </span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Mi Pedido</span>
          </button>

          {/* Ubicación */}
          <button
            onClick={() => setIsMapOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Ubicación</span>
          </button>

          {/* Contacto */}
          <button
            onClick={() => setIsContactOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Contacto</span>
          </button>
        </div>
      </nav>

      {/* Detail Drawer Modal para Mapa (z-index 100 igual que los productos) */}
      {isMapOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMapOpen(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up">

            {/* Cabecera para arrastrar (visual) */}
            <div className="absolute top-0 w-full z-10 flex flex-col items-center pt-3 pb-2 bg-gradient-to-b from-black/5 to-transparent pointer-events-none">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2 sm:hidden"></div>
            </div>

            <button
              onClick={() => setIsMapOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-gray-800 border border-gray-200 active:scale-95 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="overflow-y-auto w-full pb-safe">
              <div className="pt-10 px-6 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <h2 className="font-sans font-bold text-xl text-[var(--black-charcoal)] leading-tight">
                      📍 Dónde estamos
                    </h2>
                    <p className="text-sm font-medium text-gray-500">Los Ceibos 19 B, A4400 Salta</p>
                  </div>
                </div>
              </div>

              {/* Mapa Embebido */}
              <div className="w-full bg-gray-100 flex-shrink-0" style={{ height: '350px' }}>
                <iframe
                  src="https://maps.google.com/maps?q=Los%20Ceibos%2019%20B,%20A4400%20Salta&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Mapa de La Nobleza"
                ></iframe>
              </div>

              {/* Acciones */}
              <div className="p-6">
                <a
                  href="https://maps.app.goo.gl/cLhF6bQkGscqvCQr5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#222] text-white py-3.5 rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
                >
                  Abrir en Google Maps
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                {renderHorarios()}

                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                  Podés retirar tus pedidos en nuestro local físico de {DIAS_KEYS.filter(k => config?.horarios?.[k]?.activo).length > 5 ? 'Lunes a Sábados' : 'nuestros días de atención'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Contact Drawer Modal */}
      {isContactOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/60 p-0 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsContactOpen(false);
          }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up">
            <div className="absolute top-0 w-full z-10 flex flex-col items-center pt-3 pb-2 bg-gradient-to-b from-black/5 to-transparent pointer-events-none">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2 sm:hidden"></div>
            </div>

            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-gray-800 border border-gray-200 active:scale-95 transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="p-8 pb-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--gold-primary)]/10 flex items-center justify-center text-[var(--gold-dark)] mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-sans font-bold text-2xl text-[var(--black-charcoal)] mb-2">
                Contactanos
              </h2>
              <p className="text-gray-500 text-sm mb-8 px-4">
                ¿Tenés alguna duda o querés hacer un pedido especial? Escribinos por WhatsApp o Instagram.
              </p>

              <div className="w-full flex flex-col gap-3">
                <a
                  href="https://wa.me/5493875875560"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp (03875875560)
                </a>

                <a
                  href="https://www.instagram.com/pollerialanobleza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#c205e0] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
