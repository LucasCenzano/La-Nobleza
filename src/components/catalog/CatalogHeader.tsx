'use client';

import Image from 'next/image';

export default function CatalogHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-cream)] pt-4 pb-2 px-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
             style={{
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
               border: '1px solid rgba(212,175,55,0.3)',
             }}>
          <Image
            src="/logo.jpg"
            alt="La Nobleza Logo"
            width={40}
            height={40}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        {/* Título de la marca */}
        <h1 className="text-2xl font-bold text-[var(--black-charcoal)] m-0 leading-none" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          La Nobleza
        </h1>
      </div>
    </header>
  );
}
