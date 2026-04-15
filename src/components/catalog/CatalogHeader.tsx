'use client';

export default function CatalogHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-cream)] pt-4 pb-2 px-4 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {/* Logo minimalista */}
        <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center relative flex-shrink-0"
             style={{
               background: 'linear-gradient(145deg, #fdf9f3, #FAEBD7)',
               boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
               border: '1px solid rgba(212,175,55,0.3)',
             }}>
          <svg viewBox="0 0 60 60" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="34" rx="13" ry="11" fill="#222" />
            <circle cx="20" cy="22" r="7" fill="#222" />
            <polygon points="13,21 9,23 13,25" fill="#D4AF37" />
            <path d="M19 15 Q22 11 20 15 Q24 10 21 16 Q25 12 22 17" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="19" cy="22" r="1.2" fill="white" />
            <circle cx="19" cy="22" r="0.6" fill="#222" />
            <path d="M28 30 Q36 25 40 32 Q36 36 28 35Z" fill="#333" />
            <path d="M43 28 Q50 22 48 30 Q45 26 48 33 Q42 30 43 35Z" fill="#222" />
            <line x1="26" y1="45" x2="24" y2="52" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="45" x2="32" y2="52" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        {/* Título de la marca */}
        <h1 className="text-2xl font-bold text-[var(--black-charcoal)] m-0 leading-none" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          La Nobleza
        </h1>
      </div>
    </header>
  );
}
