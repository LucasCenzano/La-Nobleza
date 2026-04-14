'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoriaConfigType, getCategoriaLabel } from '@/lib/constants';

interface ProductoOrden {
  id:          string;
  nombre:      string;
  categoria:   string;
  precio:      number;
  activo:      boolean;
  imagenUrl:   string | null;
  imagenesUrls: string[];
  orden:       number;
}

interface Props {
  initialProductos: ProductoOrden[];
  categorias:       CategoriaConfigType[];
}

// ─── Sortable row ─────────────────────────────────────────────────────────────
function SortableProductRow({
  producto,
  index,
  categorias,
}: {
  producto: ProductoOrden;
  index: number;
  categorias: CategoriaConfigType[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: producto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 50 : ('auto' as const),
  };

  const thumb = producto.imagenesUrls?.[0] || producto.imagenUrl;
  const catLabel = getCategoriaLabel(producto.categoria, categorias);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm ${
        !producto.activo ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-xl' : ''}`}
    >
      {/* Position number */}
      <span className="text-xs font-bold text-gray-300 w-6 text-center flex-shrink-0">
        {index + 1}
      </span>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none touch-none text-xl leading-none flex-shrink-0"
        title="Arrastrar para reordenar"
      >
        ⠿
      </div>

      {/* Thumbnail */}
      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {thumb ? (
          <Image src={thumb} alt={producto.nombre} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🍗</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{producto.nombre}</p>
        <p className="text-xs text-gray-400">{catLabel}</p>
      </div>

      {/* Status */}
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
          producto.activo
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}
      >
        {producto.activo ? 'Activo' : 'Pausado'}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrdenCatalogo({ initialProductos, categorias }: Props) {
  const [productos, setProductos] = useState(initialProductos);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [dirty,     setDirty]     = useState(false);
  const productosRef = useRef(productos);
  useEffect(() => { productosRef.current = productos; }, [productos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const arr  = [...productosRef.current];
    const from = arr.findIndex((p) => p.id === active.id);
    const to   = arr.findIndex((p) => p.id === over.id);
    if (from === -1 || to === -1) return;

    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setProductos(arr);
    setDirty(true);
    setSaved(false);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    const payload = productos.map((p, i) => ({ id: p.id, orden: i }));
    const res = await fetch('/api/admin/orden', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setDirty(false);
    }
  }, [productos]);

  function handleReset() {
    setProductos(initialProductos);
    setDirty(false);
    setSaved(false);
  }

  return (
    <div>
      {/* Save bar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {dirty
              ? '⚠️ Tenés cambios sin guardar'
              : saved
              ? '✅ Orden guardado correctamente'
              : `${productos.length} productos — arrastrá para reordenar`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            El orden se refleja inmediatamente en el catálogo público
          </p>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={handleReset} className="btn-secondary text-sm">
              ✕ Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? '⟳ Guardando...' : '💾 Guardar orden'}
          </button>
        </div>
      </div>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={productos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {productos.map((p, i) => (
              <SortableProductRow
                key={p.id}
                producto={p}
                index={i}
                categorias={categorias}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
