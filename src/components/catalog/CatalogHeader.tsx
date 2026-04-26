'use client';

import Image from 'next/image';
import { useCart } from './CartContext';

export default function CatalogHeader() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-cream)]/95 backdrop-blur-md pt-4 pb-2 md:pt-4 md:pb-4 px-4 flex items-center justify-between md:px-8 border-b border-transparent md:border-gray-200/50 shadow-sm md:shadow-none">
      <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start pt-1 md:pt-0">
        {/* Logo */}
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden flex-shrink-0"
             style={{
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
               border: '1px solid rgba(212,175,55,0.3)',
             }}>
          <Image
            src="/logo.jpg"
            alt="La Nobleza Logo"
            width={44}
            height={44}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        {/* Título de la marca */}
        <h1 className="text-2xl md:text-[28px] font-bold text-[var(--black-charcoal)] m-0 leading-none" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          La Nobleza
        </h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-5 lg:gap-6 pt-1">
        <a href="https://maps.app.goo.gl/cLhF6bQkGscqvCQr5" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[var(--gold-dark)] font-semibold text-sm flex items-center gap-1.5 transition-colors">
          📍 Ubicación
        </a>
        <a href="https://www.instagram.com/pollerialanobleza" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[var(--gold-dark)] font-semibold text-sm flex items-center gap-1.5 transition-colors">
          📷 Instagram
        </a>
        <a href="https://wa.me/5493875875560" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[var(--gold-dark)] font-semibold text-sm flex items-center gap-1.5 transition-colors">
          📱 WhatsApp
        </a>
        
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="flex items-center gap-2 text-white font-bold bg-[var(--black-charcoal)] px-6 py-2.5 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <span className="text-lg">🛒</span>
          Mi Pedido
          {totalItems > 0 && <span className="bg-white text-[var(--black-charcoal)] text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
}
