'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Producto, TipoVenta } from '@prisma/client';
import { TIPO_VENTA_LABELS, ETIQUETAS, EtiquetaSlug, CategoriaConfigType } from '@/lib/constants';
import ImageUploader, { UploadedImage } from '@/components/admin/ImageUploader';

interface ProductFormProps {
  initialData?: Partial<Producto & { imagenesUrls?: string[]; etiquetas?: string[] }>;
  mode: 'create' | 'edit';
}

const TIPOS_VENTA = Object.entries(TIPO_VENTA_LABELS) as [TipoVenta, string][];

function urlsToImages(urls: string[]): UploadedImage[] {
  return urls.map((url) => ({ id: `existing-${url}`, url, uploaded: true }));
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();

  const seedUrls: string[] = initialData?.imagenesUrls?.length
    ? initialData.imagenesUrls
    : initialData?.imagenUrl ? [initialData.imagenUrl] : [];

  const [form, setForm] = useState({
    nombre:       initialData?.nombre       ?? '',
    descripcion:  initialData?.descripcion  ?? '',
    precio:       initialData?.precio?.toString()       ?? '',
    precioOferta: (initialData as any)?.precioOferta?.toString() ?? '',
    stock:        (initialData as any)?.stock?.toString() ?? '',
    incrementoPeso: (initialData as any)?.incrementoPeso?.toString() ?? (initialData?.tipoVenta === 'PESO' ? '0.100' : ''),
    categoria:    (initialData as any)?.categoria       ?? '',
    tipoVenta:    initialData?.tipoVenta    ?? 'UNIDAD',
    activo:       initialData?.activo       ?? true,
  });

  const [etiquetas, setEtiquetas] = useState<string[]>(
    (initialData as any)?.etiquetas ?? [],
  );
  const [images, setImages]   = useState<UploadedImage[]>(urlsToImages(seedUrls));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [categorias, setCategorias] = useState<CategoriaConfigType[]>([]);

  // Load dynamic categories
  useEffect(() => {
    fetch('/api/admin/categorias')
      .then((r) => r.json())
      .then((data) => {
        const active = (data as CategoriaConfigType[]).filter((c) => c.activo);
        setCategorias(active);
        // If no category selected yet, pick first
        if (!form.categoria && active.length > 0) {
          setForm((p) => ({ ...p, categoria: active[0].slug }));
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  function toggleEtiqueta(slug: EtiquetaSlug) {
    setEtiquetas((prev) =>
      prev.includes(slug) ? prev.filter((e) => e !== slug) : [...prev, slug],
    );
  }

  const handleImagesChange = useCallback((updated: UploadedImage[]) => {
    setImages(updated);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (images.some((img) => !img.uploaded)) {
      setError('Esperá a que terminen de subirse todas las fotos.');
      return;
    }

    setLoading(true);
    const imagenesUrls = images.map((img) => img.url);

    // Auto-add OFERTA etiqueta if sale price is set, auto-remove if not
    let finalEtiquetas = [...etiquetas];
    if (form.precioOferta && Number(form.precioOferta) > 0) {
      if (!finalEtiquetas.includes('OFERTA')) finalEtiquetas.push('OFERTA');
    } else {
      finalEtiquetas = finalEtiquetas.filter((e) => e !== 'OFERTA');
    }

    const payload = {
      ...form,
      precio:       parseFloat(form.precio),
      precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : null,
      stock:        form.stock ? parseFloat(form.stock) : null,
      incrementoPeso: form.incrementoPeso ? parseFloat(form.incrementoPeso) : null,
      imagenesUrls,
      imagenUrl:    imagenesUrls[0] ?? null,
      etiquetas:    finalEtiquetas,
    };

    const url =
      mode === 'create'
        ? '/api/admin/productos'
        : `/api/admin/productos/${initialData?.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/admin/productos');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? 'Ocurrió un error. Intentá de nuevo.');
    }
  }

  const pendingUploads = images.filter((i) => !i.uploaded).length;
  const hasOferta = !!form.precioOferta && Number(form.precioOferta) > 0;
  const descuento = hasOferta && form.precio
    ? Math.round((1 - Number(form.precioOferta) / Number(form.precio)) * 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-6 max-w-2xl transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* ── Nombre + Precio ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre del producto *</label>
          <input id="nombre" name="nombre" type="text" required
            value={form.nombre} onChange={handleChange}
            className="input" placeholder="Ej: Pollo Entero" />
        </div>
        <div>
          <label htmlFor="precio" className="label">Precio normal (ARS) *</label>
          <input id="precio" name="precio" type="number" required
            min={0} step={0.01}
            value={form.precio} onChange={handleChange}
            className="input" placeholder="0.00" />
        </div>
      </div>

      {/* ── Precio de Oferta ─────────────────────────────────── */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
        <label htmlFor="precioOferta" className="label text-red-700">
          🔥 Precio de Oferta (ARS)
          <span className="ml-1 font-normal text-red-500 text-xs">— dejá vacío si no hay oferta</span>
        </label>
        <div className="flex items-center gap-3 mt-1">
          <input
            id="precioOferta" name="precioOferta" type="number"
            min={0} step={0.01}
            value={form.precioOferta} onChange={handleChange}
            className="input flex-1"
            placeholder="0.00"
          />
          {hasOferta && descuento > 0 && (
            <span className="shrink-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              -{descuento}% OFF
            </span>
          )}
        </div>
        {hasOferta && (
          <p className="text-xs text-red-600 mt-1.5">
            ✅ Se mostrará tachado el precio original con el precio de oferta resaltado.
            La etiqueta <strong>OFERTA</strong> se agrega automáticamente.
          </p>
        )}
      </div>

      {/* ── Categoría + Tipo de Venta ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria" className="label">Categoría *</label>
          <select id="categoria" name="categoria"
            value={form.categoria} onChange={handleChange} className="input">
            {categorias.length === 0 && (
              <option value="">Cargando categorías…</option>
            )}
            {categorias.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.emoji} {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoVenta" className="label">Tipo de venta *</label>
          <select id="tipoVenta" name="tipoVenta"
            value={form.tipoVenta} onChange={(e) => {
              handleChange(e);
              if (e.target.value === 'PESO' && !form.incrementoPeso) {
                setForm(p => ({ ...p, incrementoPeso: '0.100' }));
              }
            }} className="input">
            {TIPOS_VENTA.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {form.tipoVenta === 'PESO'
              ? '⚖️ Precio se muestra como "por Kg"'
              : '📦 Precio se muestra como "por Unidad"'}
          </p>
        </div>
      </div>

      {/* ── Stock y Pesaje ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="stock" className="label">Stock Disponible</label>
          <input id="stock" name="stock" type="number"
            min={0} step={form.tipoVenta === 'PESO' ? 0.001 : 1}
            value={form.stock} onChange={handleChange}
            className="input" placeholder={form.tipoVenta === 'PESO' ? 'Ej: 50 (kg)' : 'Ej: 10'} />
          <p className="text-xs text-gray-400 mt-1">
            Vacío = ilimitado. {form.tipoVenta === 'PESO' ? 'Introduzca los kg. totales.' : 'Introduzca el nro. de unidades.'}
          </p>
        </div>
        {form.tipoVenta === 'PESO' && (
          <div>
            <label htmlFor="incrementoPeso" className="label">Paso de Venta (Kg) *</label>
            <input id="incrementoPeso" name="incrementoPeso" type="number"
              min={0.05} step={0.001} required
              value={form.incrementoPeso} onChange={handleChange}
              className="input" placeholder="Ej: 0.100 (100gr)" />
            <p className="text-xs text-gray-400 mt-1">
              Incremento del selector. Ej: 0.100 permite pedir de a 100 gramos.
            </p>
          </div>
        )}
      </div>


      {/* ── Descripción ───────────────────────────────────────── */}
      <div>
        <label htmlFor="descripcion" className="label">Descripción corta</label>
        <textarea id="descripcion" name="descripcion" rows={5}
          value={form.descripcion} onChange={handleChange}
          className="input resize-y min-h-[100px]"
          placeholder="Descripción opcional del producto..." />
      </div>

      {/* ── Etiquetas ─────────────────────────────────────────── */}
      <div>
        <label className="label mb-2 block">Etiquetas</label>
        <div className="flex flex-wrap gap-3">
          {ETIQUETAS.map((et) => {
            const active = etiquetas.includes(et.slug);
            const isAutoOferta = et.slug === 'OFERTA' && hasOferta;
            return (
              <button
                key={et.slug}
                type="button"
                disabled={isAutoOferta}
                onClick={() => toggleEtiqueta(et.slug as EtiquetaSlug)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  active
                    ? `${et.bg} ${et.text} border-current shadow-sm`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                } ${isAutoOferta ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span>{et.emoji}</span>
                {et.label}
                {isAutoOferta && <span className="text-[10px] opacity-70">(auto)</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Las etiquetas se muestran como badges en el catálogo público.
          <strong> OFERTA</strong> se activa automáticamente al poner precio de oferta.
        </p>
      </div>

      {/* ── Fotos ─────────────────────────────────────────────── */}
      <div>
        <label className="label mb-2 block">
          Fotos del producto
          {pendingUploads > 0 && (
            <span className="ml-2 text-xs text-amber-600 font-normal animate-pulse">
              ⏳ Subiendo {pendingUploads} foto{pendingUploads > 1 ? 's' : ''}…
            </span>
          )}
        </label>
        <ImageUploader images={images} onChange={handleImagesChange} maxImages={8} />
      </div>

      {/* ── Estado (activo) ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <label className="toggle" aria-label="Estado del producto">
          <input type="checkbox" name="activo"
            checked={form.activo} onChange={handleChange} />
          <span className="toggle-track"><span className="toggle-thumb" /></span>
        </label>
        <span className="text-sm font-medium text-gray-700">
          {form.activo ? '✅ Activo (visible en catálogo)' : '⏸️ Pausado (oculto del catálogo)'}
        </span>
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* ── Acciones ──────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || pendingUploads > 0}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center transition-all bg-[var(--gold-dark)]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando producto...
            </span>
          ) : pendingUploads > 0 ? (
            `⏳ Esperando ${pendingUploads} foto${pendingUploads > 1 ? 's' : ''}…`
          ) : mode === 'create' ? (
            '✅ Crear Producto'
          ) : (
            '💾 Guardar Cambios'
          )}
        </button>
        <button type="button"
          onClick={() => router.push('/admin/productos')}
          className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
