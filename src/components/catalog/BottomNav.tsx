'use client';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50">
      <div className="flex justify-around items-center h-16">
        {/* Inicio */}
        <button className="flex flex-col items-center justify-center w-full h-full text-[#C5A059]">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </button>

        {/* Ubicación */}
        <a 
          href="https://maps.app.goo.gl/cLhF6bQkGscqvCQr5" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-medium">Ubicación</span>
        </a>

        {/* Contacto / Perfil */}
        <button className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C5A059] transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Contacto</span>
        </button>
      </div>
    </nav>
  );
}
