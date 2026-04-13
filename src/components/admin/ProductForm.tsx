'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Producto, Categoria, TipoVenta } from '@prisma/client';
import { CATEGORIA_LABELS, TIPO_VENTA_LABELS } from '@/lib/constants';
import Image from 'next/image';

interface ProductFormProps {
  initialData?: Partial<Producto>;
  mode: 'create' | 'edit';
}

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [Categoria, string][];
const TIPOS_VENTA = Object.entries(TIPO_VENTA_LABELS) as [TipoVenta, string][];

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre:     initialData?.nombre     ?? '',
    descripcion: initialData?.descripcion ?? '',
    precio:     initialData?.precio?.toString() ?? '',
    categoria:  initialData?.categoria  ?? 'POLLO_ENTERO',
    tipoVenta:  initialData?.tipoVenta  ?? 'UNIDAD',
    imagenUrl:  initialData?.imagenUrl  ?? '',
    activo:     initialData?.activo     ?? true,
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [preview,  setPreview]  = useState(form.imagenUrl);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (name === 'imagenUrl') setPreview(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      precio: parseFloat(form.precio),
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Row 1: Nombre + Precio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre del producto *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            className="input"
            placeholder="Ej: Pollo Entero"
          />
        </div>
        <div>
          <label htmlFor="precio" className="label">Precio (ARS) *</label>
          <input
            id="precio"
            name="precio"
            type="number"
            required
            min={0}
            step={0.01}
            value={form.precio}
            onChange={handleChange}
            className="input"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Row 2: Categoría + Tipo de Venta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria" className="label">Categoría *</label>
          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="input"
          >
            {CATEGORIAS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoVenta" className="label">Tipo de venta *</label>
          <select
            id="tipoVenta"
            name="tipoVenta"
            value={form.tipoVenta}
            onChange={handleChange}
            className="input"
          >
            {TIPOS_VENTA.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {form.tipoVenta === 'PESO'
              ? '⚖️ El precio se mostrará como "por Kg"'
              : '📦 El precio se mostrará como "por Unidad"'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="descripcion" className="label">Descripción corta</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          value={form.descripcion}
          onChange={handleChange}
          className="input resize-none"
          placeholder="Descripción opcional del producto..."
        />
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imagenUrl" className="label">URL de imagen</label>
        <input
          id="imagenUrl"
          name="imagenUrl"
          type="url"
          value={form.imagenUrl}
          onChange={handleChange}
          className="input"
          placeholder="https://utfs.io/f/..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Pegá la URL de la imagen (UploadThing, Cloudinary, etc.)
        </p>

        {/* Preview */}
        {preview && (
          <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border border-cream-200 bg-cream-100">
            <Image
              src={preview}
              alt="Vista previa"
              fill
              className="object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={() => { setPreview(''); setForm((p) => ({ ...p, imagenUrl: '' })); }}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <label className="toggle" aria-label="Estado del producto">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
        </label>
        <span className="text-sm font-medium text-gray-700">
          {form.activo ? '✅ Activo (visible en catálogo)' : '⏸️ Pausado (oculto del catálogo)'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? '⟳ Guardando...'
            : mode === 'create'
            ? '✅ Crear Producto'
            : '💾 Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/productos')}
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
