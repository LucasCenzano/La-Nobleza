'use client';

import { useState } from 'react';

export default function BottomNav() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50">
        <div className="flex justify-around items-center h-16">
          {/* Inicio (Scrolls to top for now, or just acts as a visual reset) */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center w-full h-full text-[#C5A059]"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Inicio</span>
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

          {/* Contacto / Perfil */}
          <button className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors">
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
                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                  Podés retirar tus pedidos en nuestro local físico de Lunes a Sábados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
