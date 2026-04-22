import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrecioSolo } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)   return 'hace un momento';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  return `hace ${Math.floor(seconds / 86400)} d`;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const PRODUCT_SELECT = {
    id: true, nombre: true, descripcion: true, precio: true, precioOferta: true,
    categoria: true, tipoVenta: true, stock: true, incrementoPeso: true,
    etiquetas: true, solicitaInstrucciones: true, opcionesTitulo: true,
    opcionesValores: true, promoPersonalizada: true, promoCantidadRequerida: true,
    promoPrecioTotal: true, activo: true, orden: true, createdAt: true, updatedAt: true,
    imagenUrl: true, imagenesUrls: true, imagenesFraming: true
  };

  const [productosData, categorias] = await Promise.all([
    prisma.producto.findMany({
      where: { eliminado: false },
      orderBy: { updatedAt: 'desc' },
      select: PRODUCT_SELECT,
    }),
    prisma.categoriaConfig.findMany({
      orderBy: { orden: 'asc' },
    })
  ]);

  const productos = productosData;
  const total    = productos.length;
  const activos  = productos.filter((p) => p.activo).length;
  const pausados = productos.filter((p) => !p.activo).length;
  const sinFoto  = productos.filter((p) => !p.imagenUrl && (!p.imagenesUrls || p.imagenesUrls.length === 0)).length;
  const enOferta = productos.filter((p) => !!(p as any).precioOferta).length;
  const recientes = productos.slice(0, 6); // already sorted by updatedAt desc

  // Category distribution
  const catMap = Object.fromEntries(
    categorias.map((c) => [c.slug, { nombre: c.nombre, emoji: c.emoji, color: c.color, count: 0 }]),
  );
  for (const p of productos) {
    if (catMap[p.categoria]) catMap[p.categoria].count++;
  }
  const catDist = Object.values(catMap).sort((a, b) => b.count - a.count);

  const STAT_CARDS = [
    {
      label: 'Total',
      value: total,
      emoji: '📦',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      ring: 'hover:ring-gray-300',
      href: '/admin/productos',
    },
    {
      label: 'Activos',
      value: activos,
      emoji: '✅',
      bg: 'bg-green-50',
      text: 'text-green-700',
      ring: 'hover:ring-green-300',
      href: '/admin/productos?estado=activos',
    },
    {
      label: 'Pausados',
      value: pausados,
      emoji: '⏸️',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      ring: 'hover:ring-amber-300',
      href: '/admin/productos?estado=pausados',
    },
    {
      label: 'Sin foto',
      value: sinFoto,
      emoji: '📷',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      ring: 'hover:ring-blue-300',
      href: '/admin/productos?estado=sin_foto',
    },
    {
      label: 'En oferta',
      value: enOferta,
      emoji: '🔥',
      bg: 'bg-red-50',
      text: 'text-red-700',
      ring: 'hover:ring-red-300',
      href: '/admin/productos?estado=en_oferta',
    },
  ];

  return (
    <>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Panel de Control
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenido, {session.user?.name ?? 'Admin'} 👋 — vista general del catálogo
          </p>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Métricas principales — tocá para ver la lista
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAT_CARDS.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={`${card.bg} ${card.text} rounded-2xl p-5 flex flex-col gap-1 transition-all duration-200 ring-2 ring-transparent ${card.ring} hover:shadow-md hover:-translate-y-0.5 group`}
              >
                <span className="text-2xl">{card.emoji}</span>
                <p className="text-3xl font-bold tabular-nums">{card.value}</p>
                <p className="text-xs font-semibold opacity-80">{card.label}</p>
                <p className="text-[10px] opacity-50 group-hover:opacity-80 transition-opacity">
                  Ver lista →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Two-column: Recent + Category dist ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Edits */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900">Últimas ediciones</h2>
              <Link href="/admin/productos" className="text-xs text-brand-600 hover:underline font-medium">
                Ver todos →
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {recientes.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Sin productos aún</p>
              ) : (
                recientes.map((p) => {
                  const hasPhoto = !!p.imagenUrl || (p.imagenesUrls && p.imagenesUrls.length > 0);
                  const thumbRaw = p.imagenesUrls?.[0] || p.imagenUrl;
                  const thumb = thumbRaw ? thumbRaw.split('#framing:')[0] : null;
                  const hasOferta = !!(p as any).precioOferta;
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-3">
                      {/* Thumbnail */}
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {thumb ? (
                          <Image src={thumb} alt={p.nombre} fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-lg">🍗</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
                          <span>{timeAgo(p.updatedAt)}</span>
                          <span>·</span>
                          <span className={p.activo ? 'text-green-600' : 'text-amber-600'}>
                            {p.activo ? 'Activo' : 'Pausado'}
                          </span>
                          {hasOferta && <><span>·</span><span className="text-red-600">🔥 Oferta</span></>}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-700">
                          {formatPrecioSolo(hasOferta ? (p as any).precioOferta : p.precio)}
                        </p>
                        {hasOferta && (
                          <p className="text-[10px] text-gray-400 line-through">
                            {formatPrecioSolo(p.precio)}
                          </p>
                        )}
                      </div>

                      {/* Edit link */}
                      <Link
                        href={`/admin/productos/${p.id}/editar`}
                        className="btn-secondary px-2.5 py-1.5 text-xs flex-shrink-0"
                      >
                        ✏️
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Category Distribution */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900">Por categoría</h2>
              <Link href="/admin/categorias" className="text-xs text-brand-600 hover:underline font-medium">
                Gestionar →
              </Link>
            </div>

            {catDist.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Sin categorías</p>
            ) : (
              <div className="flex flex-col gap-2">
                {catDist.map((cat) => (
                  <Link
                    key={cat.nombre}
                    href={`/admin/productos?categoria=${encodeURIComponent(
                      categorias.find((c) => c.nombre === cat.nombre)?.slug ?? '',
                    )}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xl w-7 text-center">{cat.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                          {cat.nombre}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: total > 0 ? `${(cat.count / total) * 100}%` : '0%',
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <section className="card p-6">
          <h2 className="font-display font-bold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/productos/nuevo" className="btn-primary">
              ➕ Nuevo Producto
            </Link>
            <Link href="/admin/categorias" className="btn-secondary">
              🏷️ Gestionar Categorías
            </Link>
            <Link href="/admin/productos?estado=pausados" className="btn-secondary">
              ⏸️ Ver Pausados
            </Link>
            <Link href="/admin/productos?estado=sin_foto" className="btn-secondary">
              📷 Sin Foto
            </Link>
            <Link href="/" target="_blank" className="btn-secondary">
              🌐 Ver Catálogo
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
