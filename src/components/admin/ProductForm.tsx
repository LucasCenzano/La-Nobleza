'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Producto, TipoVenta } from '@prisma/client';
import { TIPO_VENTA_LABELS, ETIQUETAS, EtiquetaSlug, CategoriaConfigType } from '@/lib/constants';
import ImageUploader, { UploadedImage } from '@/components/admin/ImageUploader';
import ProductCard from '@/components/catalog/ProductCard';

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
    solicitaInstrucciones: (initialData as any)?.solicitaInstrucciones ?? false,
    opcionesTitulo: (initialData as any)?.opcionesTitulo ?? '',
    opcionesValoresStr: (initialData as any)?.opcionesValores?.join(', ') ?? '',
    activo:       initialData?.activo       ?? true,
  });

  const [enOferta, setEnOferta] = useState(
    !!(initialData as any)?.precioOferta && Number((initialData as any)?.precioOferta) > 0
  );

  const [etiquetas, setEtiquetas] = useState<string[]>(
    (initialData as any)?.etiquetas ?? [],
  );
  const [images, setImages]   = useState<UploadedImage[]>(urlsToImages(seedUrls));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaConfigType[]>([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

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
    // Real time validation for negative prices/stock
    if (type === 'number' && Number(value) < 0) return;
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
    setIsSubmitted(true);
    setError('');

    // Pre-validations
    if (!form.nombre || !form.precio || !form.categoria || !form.tipoVenta) {
      setError('Por favor, completá los campos obligatorios.');
      return;
    }

    if (images.some((img) => !img.uploaded)) {
      setError('Esperá a que terminen de subirse todas las fotos.');
      return;
    }

    setLoading(true);
    const imagenesUrls = images.map((img) => img.url);

    // Auto-add OFERTA etiqueta
    let finalEtiquetas = [...etiquetas];
    if (enOferta && form.precioOferta && Number(form.precioOferta) > 0) {
      if (!finalEtiquetas.includes('OFERTA')) finalEtiquetas.push('OFERTA');
    } else {
      finalEtiquetas = finalEtiquetas.filter((e) => e !== 'OFERTA');
    }

    const payload = {
      ...form,
      precio:       parseFloat(form.precio),
      precioOferta: (enOferta && form.precioOferta) ? parseFloat(form.precioOferta) : null,
      stock:        form.stock ? parseFloat(form.stock) : null,
      incrementoPeso: form.incrementoPeso ? parseFloat(form.incrementoPeso) : null,
      imagenesUrls,
      imagenUrl:    imagenesUrls[0] ?? null,
      etiquetas:    finalEtiquetas,
      solicitaInstrucciones: form.solicitaInstrucciones,
      opcionesTitulo: form.opcionesTitulo.trim() || null,
      opcionesValores: form.opcionesValoresStr.split(',').map((s: string) => s.trim()).filter(Boolean),
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

    if (res.ok) {
      router.push('/admin/productos');
      router.refresh();
    } else {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? 'Ocurrió un error. Intentá de nuevo.');
    }
  }

  const pendingUploads = images.filter((i) => !i.uploaded).length;
  const hasOferta = enOferta && !!form.precioOferta && Number(form.precioOferta) > 0;
  const descuento = hasOferta && form.precio
    ? Math.round((1 - Number(form.precioOferta) / Number(form.precio)) * 100)
    : 0;

  // ─── Live Preview Object ──────────────
  const finalPreviewEtiquetas = hasOferta
    ? Array.from(new Set([...etiquetas, 'OFERTA']))
    : etiquetas.filter(e => e !== 'OFERTA');

  const previewProduct = {
    id: initialData?.id || 'preview-id',
    nombre: form.nombre || 'Título del producto...',
    descripcion: form.descripcion,
    precio: parseFloat(form.precio) || 0,
    precioOferta: hasOferta ? parseFloat(form.precioOferta) : null,
    categoria: form.categoria || 'OTROS',
    tipoVenta: form.tipoVenta,
    stock: form.stock ? parseFloat(form.stock) : null,
    incrementoPeso: form.incrementoPeso ? parseFloat(form.incrementoPeso) : null,
    solicitaInstrucciones: form.solicitaInstrucciones,
    opcionesTitulo: form.opcionesTitulo.trim() || null,
    opcionesValores: form.opcionesValoresStr.split(',').map((s: string) => s.trim()).filter(Boolean),
    activo: form.activo,
    etiquetas: finalPreviewEtiquetas,
    imagenUrl: images[0]?.url || null,
    imagenesUrls: images.map(i => i.url),
  } as null | any;

  const SECTIONS = [
    { id: 'basicos', title: 'Datos Básicos', emoji: '📝' },
    { id: 'precios', title: 'Precios', emoji: '💰' },
    { id: 'inventario', title: 'Inventario', emoji: '📦' },
    { id: 'visual', title: 'Visual', emoji: '🖼️' },
    { id: 'config', title: 'Ajustes', emoji: '⚙️' },
  ];

  return (
    <div className="flex flex-col pb-24 relative min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* ── COL 1: FORMULARIO ──────────────────────────────── */}
        <div className="flex-1 w-full flex flex-col gap-6">

          {/* ── Tabs Navegación ── */}
          <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md pb-3 pt-3 flex gap-2 overflow-x-auto snap-x border-b border-gray-200/50 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-bold shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all focus:ring-2 focus:ring-brand-500 outline-none">
                {s.emoji} {s.title}
              </a>
            ))}
          </div>

          <form id="product-form" onSubmit={handleSubmit} className={`flex flex-col gap-12 transition-opacity duration-300 group ${isSubmitted ? 'submitted' : ''} ${loading ? 'opacity-60 pointer-events-none' : ''}`}>

            {/* ERROR GLOBAL */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-medium">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {/* ── MÓDULO 1: DATOS BÁSICOS ────────────────────────── */}
            <section id="basicos" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="text-2xl">📝</span> Datos Básicos
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="nombre" className="label font-bold">Nombre del producto *</label>
                  <input id="nombre" name="nombre" type="text" required
                    value={form.nombre} onChange={handleChange}
                    className="input group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:bg-red-50 group-[.submitted]:invalid:ring-red-200 focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400 transition-all mt-1.5" 
                    placeholder="Ej: Pollo Entero" />
                  <div className="hidden group-[.submitted]:input-invalid:flex absolute right-3 top-[42px] items-center text-red-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="categoria" className="label font-bold">Categoría *</label>
                  <select id="categoria" name="categoria" required
                    value={form.categoria} onChange={handleChange} 
                    className="input group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:bg-red-50 focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] transition-all mt-1.5">
                    {categorias.length === 0 && <option value="">Cargando categorías…</option>}
                    {categorias.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.emoji} {cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ── MÓDULO 2: PRECIOS Y VENTA ──────────────────────── */}
            <section id="precios" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="text-2xl">💰</span> Precios y Venta
              </h2>
              
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="relative flex-1 w-full">
                  <label htmlFor="precio" className="label font-bold">Precio Normal (ARS) *</label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input id="precio" name="precio" type="number" required min={0} step={0.01}
                      value={form.precio} onChange={handleChange}
                      className="input pl-8 font-bold text-lg group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:bg-red-50 focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400 transition-all w-full" 
                      placeholder="0.00" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full xl:w-auto shrink-0">
                  <label className="label font-bold mt-1.5 mb-1.5 text-balance md:whitespace-nowrap break-words">¿Tiene oferta o descuento?</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 w-full">
                    <label className="toggle shrink-0" aria-label="En Oferta">
                      <input type="checkbox" checked={enOferta} onChange={(e) => {
                        setEnOferta(e.target.checked);
                        if (!e.target.checked) setForm(p => ({ ...p, precioOferta: '' }));
                      }} />
                      <span className="toggle-track"><span className="toggle-thumb" /></span>
                    </label>
                    <span className="text-sm font-bold text-gray-700">Sí, destacar en oferta 🔥</span>
                  </div>
                </div>
              </div>

              {/* Precio Oferta input */}
              <div className={`overflow-hidden transition-all duration-300 ${enOferta ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl">
                  <label htmlFor="precioOferta" className="label font-bold text-red-800">
                    Precio de Oferta (ARS) *
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold">$</span>
                      <input id="precioOferta" name="precioOferta" type="number" 
                        required={enOferta} min={0} step={0.01}
                        value={form.precioOferta} onChange={handleChange}
                        className="input pl-8 font-bold text-lg border-red-200 focus:ring-red-400 group-[.submitted]:invalid:border-red-500 group-[.submitted]:invalid:ring-red-300 text-red-900" 
                        placeholder="0.00" />
                    </div>
                    {hasOferta && descuento > 0 && (
                      <div className="shrink-0 bg-red-600 text-white font-black px-4 py-3 rounded-xl shadow-sm animate-fade-in flex flex-col items-center leading-none">
                        <span className="text-[10px] opacity-80 mb-0.5">DESCUENTO</span>
                        <span className="text-lg">-{descuento}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <label htmlFor="tipoVenta" className="label font-bold">Tipo de Venta *</label>
                  <select id="tipoVenta" name="tipoVenta" required
                    value={form.tipoVenta} onChange={(e) => {
                      handleChange(e);
                      if (e.target.value === 'PESO' && !form.incrementoPeso) {
                        setForm(p => ({ ...p, incrementoPeso: '0.100' }));
                      }
                    }} className="input mt-1.5 focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] transition-all">
                    {TIPOS_VENTA.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {form.tipoVenta === 'PESO' && (
                  <div className="animate-fade-in bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 -mt-2">
                    <label htmlFor="incrementoPeso" className="label font-bold text-amber-900">Paso de Venta (Kg) *</label>
                    <input id="incrementoPeso" name="incrementoPeso" type="number"
                      min={0.05} step={0.001} required
                      value={form.incrementoPeso} onChange={handleChange}
                      className="input mt-1.5 bg-white border-amber-200 focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400" placeholder="Ej: 0.100" />
                    <p className="text-[11px] text-amber-700 font-medium mt-2 leading-tight">
                      Incremento que puede elegir el cliente al agregar al carrito.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ── MÓDULO 3: INVENTARIO ──────────────────────────── */}
            <section id="inventario" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="text-2xl">📦</span> Inventario
              </h2>
              
              <div className="max-w-md">
                <label htmlFor="stock" className="label font-bold">Stock Disponible</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input id="stock" name="stock" type="number"
                    min={0} step={form.tipoVenta === 'PESO' ? 0.001 : 1}
                    value={form.stock} onChange={handleChange}
                    className="input focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400" placeholder="Ej: ilimitado si lo dejás vacío" />
                  <span className="shrink-0 bg-gray-100 text-gray-500 font-bold px-4 py-3 rounded-xl border border-gray-200">
                    {form.tipoVenta === 'PESO' ? 'KG' : 'UNID.'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium mt-2">
                  Tip: Dejá el campo vacío si el stock es ilimitado.
                </p>
              </div>
            </section>

            {/* ── MÓDULO 4: PRESENTACIÓN VISUAL ─────────────────── */}
            <section id="visual" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="text-2xl">🖼️</span> Presentación Visual
              </h2>
              
              {/* Fotos Dropzone */}
              <div>
                <label className="label font-bold flex items-center justify-between mb-3">
                  Fotos del Producto
                  {pendingUploads > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Subiendo {pendingUploads}...
                    </span>
                  )}
                </label>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <ImageUploader images={images} onChange={handleImagesChange} maxImages={8} />
                </div>
              </div>

              {/* Descripción */}
              <div className="pt-2">
                <label htmlFor="descripcion" className="label font-bold">Descripción Corta</label>
                <textarea id="descripcion" name="descripcion" rows={3}
                  value={form.descripcion} 
                  onChange={(e) => {
                     e.target.style.height = 'auto';
                     e.target.style.height = `${e.target.scrollHeight}px`;
                     handleChange(e);
                  }}
                  className="input mt-1.5 min-h-[120px] overflow-hidden focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400 transition-all"
                  placeholder="Detalles sobre el origen, calidad, ingredientes..." />
              </div>

              {/* Etiquetas */}
              <div className="pt-2">
                <label className="label font-bold block mb-3">Etiquetas / Badges Promocionales</label>
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
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 ${
                          active
                            ? `${et.bg} ${et.text} border-current shadow-sm scale-105`
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${isAutoOferta ? 'opacity-50 cursor-not-allowed scale-100' : 'cursor-pointer'}`}
                      >
                        <span className="text-lg">{et.emoji}</span>
                        {et.label}
                        {isAutoOferta && <span className="text-[10px] uppercase font-black tracking-wider opacity-70 ml-1">(Auto)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── MÓDULO 5: CONFIGURACIÓN ───────────────────────── */}
            <section id="config" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24">
              <h2 className="text-xl font-bold text-[var(--black-charcoal)] flex items-center gap-3 border-b border-gray-50 pb-4">
                <span className="text-2xl">⚙️</span> Configuración y Estado
              </h2>
              
              <div className="flex flex-col gap-5">
                {/* Switch Estado Activo */}
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}>
                  <label className="toggle pointer-events-none" aria-label="Estado del producto">
                    <input type="checkbox" name="activo" checked={form.activo} readOnly />
                    <span className="toggle-track"><span className="toggle-thumb" /></span>
                  </label>
                  <div className="flex flex-col">
                    <span className={`text-sm font-black ${form.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                      {form.activo ? '✅ Visible en el Catálogo' : '⏸️ Oculto (Pausado)'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Activá esto para que los clientes puedan comprarlo.
                    </span>
                  </div>
                </div>

                {/* Switch Opciones de Pedido */}
                <div className={`p-5 rounded-2xl transition-colors border ${form.solicitaInstrucciones ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-start gap-4 cursor-pointer" onClick={() => setForm(f => ({ ...f, solicitaInstrucciones: !f.solicitaInstrucciones }))}>
                    <label className="toggle mt-1 pointer-events-none" aria-label="Solicitar Instrucciones">
                      <input type="checkbox" name="solicitaInstrucciones" checked={form.solicitaInstrucciones} readOnly />
                      <span className="toggle-track bg-emerald-500"><span className="toggle-thumb" /></span>
                    </label>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-emerald-950">
                        Opciones de Pedido Personalizadas
                      </span>
                      <span className="text-xs text-emerald-700 font-medium mt-0.5">
                        Preguntale al cliente cómo quiere la preparación (ej: fileteado, sin hueso).
                      </span>
                    </div>
                  </div>

                  {form.solicitaInstrucciones && (
                    <div className="flex flex-col gap-6 mt-5 pt-5 border-t border-emerald-200/50 animate-fade-in pl-2 lg:pl-12">
                      <div className="flex flex-col">
                        <label htmlFor="opcionesTitulo" className="label font-bold text-emerald-900 mb-2">Pregunta Formulario</label>
                        <input id="opcionesTitulo" name="opcionesTitulo" type="text"
                          value={form.opcionesTitulo} onChange={handleChange} onClick={e => e.stopPropagation()}
                          className="input border-emerald-200 bg-white focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400 mt-1" placeholder="Ej: ¿Cómo querés la carne?" />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="opcionesValoresStr" className="label font-bold text-emerald-900 mb-2">Opciones Predefinidas</label>
                        <textarea id="opcionesValoresStr" name="opcionesValoresStr" rows={2}
                          value={form.opcionesValoresStr} onChange={handleChange} onClick={e => e.stopPropagation()}
                          className="input border-emerald-200 bg-white focus:ring-2 focus:ring-[var(--gold-main)] focus:border-[var(--gold-main)] placeholder-gray-400 mt-1 resize-none" placeholder="Entero, Mitades, Picado" />
                        <p className="text-[11px] text-emerald-700 font-medium mt-1.5">
                          Escribí las opciones separadas por coma. Si lo dejás vacío, será un campo de texto libre.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* ── COL 2: LIVE PREVIEW (STICKY) ─────────────────────── */}
        <div className="hidden lg:flex w-[350px] shrink-0 sticky top-24 flex-col gap-3">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-gray-400 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              Vista Previa en Vivo
            </h3>
          </div>
          
          <div className="bg-white rounded-[2rem] p-1.5 shadow-2xl shadow-black/10 border border-gray-100 relative group overflow-hidden">
            {/* The actual product card preview */}
            <div className="pointer-events-auto cursor-pointer">
              <ProductCard producto={previewProduct} categorias={categorias} />
            </div>
            
            {/* Overlay hint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 pointer-events-none">
              <span className="text-white text-xs font-bold tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                VISTA DEL CLIENTE
              </span>
            </div>
          </div>
          
          <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-widest mt-1">
            Replicación Exacta del Catálogo
          </p>
        </div>
      </div>

      {/* ── GLOBAL ACTIONS BAR (STICKY BOTTOM) ────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/60 p-4 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-2 sm:px-4">
          <div className="hidden sm:flex items-center gap-3">
             <span className="text-2xl opacity-50">✍️</span>
             <div className="flex flex-col">
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{mode === 'create' ? 'Creando:' : 'Editando:'}</span>
               <span className="text-sm font-bold text-gray-800 line-clamp-1">{form.nombre || 'Nuevo Producto'}</span>
             </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button type="button"
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all text-xl"
              aria-label="Ver Previa Móvil"
            >
              👁️
            </button>
            <button type="button"
              onClick={() => router.push('/admin/productos')}
              className="hidden sm:inline-flex px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-sm items-center">
              Cancelar
            </button>
            <button
              form="product-form"
              type="submit"
              disabled={loading || pendingUploads > 0}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-[var(--gold-dark)] shadow-lg shadow-[var(--gold-dark)]/30 hover:shadow-xl hover:shadow-[var(--gold-dark)]/40 hover:-translate-y-0.5 active:scale-95 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : pendingUploads > 0 ? (
                `⏳ Subiendo ${pendingUploads}...`
              ) : mode === 'create' ? (
                '✅ Crear Producto'
              ) : (
                '💾 Guardar Cambios'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* ── MOBILE MODAL PREVIEW ── */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex flex-col justify-end lg:hidden animate-fade-in touch-none" onClick={() => setShowMobilePreview(false)}>
          <div className="w-full bg-gray-50 rounded-t-[2.5rem] p-5 pb-safe flex flex-col shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Modal de Cliente
              </h3>
              <button type="button" className="bg-gray-200 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold active:scale-90" onClick={() => setShowMobilePreview(false)}>✕</button>
            </div>
            
            <div className="w-full max-w-sm mx-auto pointer-events-auto">
              {/* Product preview interactive wrapper */}
              <div className="pointer-events-auto cursor-pointer pb-2">
                <ProductCard producto={previewProduct} categorias={categorias} />
              </div>
              <p className="text-[11px] font-bold text-gray-400 text-center uppercase tracking-widest mt-4">
                Clickeá la tarjeta para explorar el detalle (simulando vista final)
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
