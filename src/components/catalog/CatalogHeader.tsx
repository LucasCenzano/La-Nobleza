export default function CatalogHeader() {
  return (
    <header className="bg-gradient-to-r from-brand-600 to-brand-500 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center">
        {/* Logo / Icon area */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 shadow-lg">
          <span className="text-3xl">🐔</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Pollería La Nobleza
        </h1>
        <p className="mt-2 text-brand-100 text-sm sm:text-base max-w-md mx-auto">
          Calidad y frescura en cada corte. Consultá nuestros precios actualizados.
        </p>
      </div>
    </header>
  );
}
