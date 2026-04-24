'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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

  const thumbRaw = producto.imagenesUrls?.[0] || producto.imagenUrl;
  const thumb = thumbRaw ? thumbRaw.split('#framing:')[0] : null;
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
  
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  const productosRef = useRef(productos);
  useEffect(() => { productosRef.current = productos; }, [productos]);

  const visibleProductos = useMemo(() => {
    if (filtroCategoria === 'TODAS') return productos;
    return productos.filter(p => p.categoria === filtroCategoria);
  }, [productos, filtroCategoria]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleProductos.findIndex((p) => p.id === active.id);
    const newIndex = visibleProductos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newVisible = [...visibleProductos];
    const [moved] = newVisible.splice(oldIndex, 1);
    newVisible.splice(newIndex, 0, moved);

    const arr = [...productosRef.current];
    const globalIndices = visibleProductos.map(vp => arr.findIndex(p => p.id === vp.id));
    globalIndices.sort((a, b) => a - b);
    
    for (let i = 0; i < globalIndices.length; i++) {
      arr[globalIndices[i]] = newVisible[i];
    }

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

  function handleAutoGroup() {
    const arr = [...productos].sort((a, b) => {
      const catA = categorias.find(c => c.slug === a.categoria)?.orden ?? 999;
      const catB = categorias.find(c => c.slug === b.categoria)?.orden ?? 999;
      if (catA !== catB) return catA - catB;
      return a.nombre.localeCompare(b.nombre);
    });
    setProductos(arr);
    setDirty(true);
    setSaved(false);
  }

  function handleSortAZ() {
    const arr = [...productosRef.current];
    const newVisible = [...visibleProductos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    const globalIndices = visibleProductos.map(vp => arr.findIndex(p => p.id === vp.id));
    globalIndices.sort((a, b) => a - b);
    
    for (let i = 0; i < globalIndices.length; i++) {
      arr[globalIndices[i]] = newVisible[i];
    }

    setProductos(arr);
    setDirty(true);
    setSaved(false);
  }

  return (
    <div className="space-y-4">
      {/* ─── Herramientas de Organización ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filtrar vista:</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="flex-1 md:w-56 text-sm border-gray-300 rounded-xl focus:ring-black focus:border-black py-2 cursor-pointer shadow-sm"
          >
            <option value="TODAS">📦 Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.slug}>{c.emoji} {c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button onClick={handleSortAZ} className="btn-secondary text-sm whitespace-nowrap flex-1 md:flex-none justify-center">
            🔤 Ordenar A-Z {filtroCategoria !== 'TODAS' ? 'esta categoría' : ''}
          </button>
          <button onClick={handleAutoGroup} className="btn-secondary text-sm whitespace-nowrap flex-1 md:flex-none justify-center">
            🪄 Agrupar todo por Categoría
          </button>
        </div>
      </div>

      {/* ─── Save bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm sticky top-[80px] z-40">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {dirty
              ? '⚠️ Tenés cambios sin guardar'
              : saved
              ? '✅ Orden guardado correctamente'
              : `${visibleProductos.length} productos ${filtroCategoria !== 'TODAS' ? 'visibles' : ''} — arrastrá para reordenar`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtroCategoria !== 'TODAS' 
              ? 'Los cambios de orden aplican a las posiciones globales de estos productos.' 
              : 'El orden se refleja inmediatamente en el catálogo público'}
          </p>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={handleReset} className="btn-secondary text-sm flex-1 sm:flex-none justify-center">
              ✕ Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="btn-primary flex-1 sm:flex-none justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? '⟳ Guardando...' : '💾 Guardar orden'}
          </button>
        </div>
      </div>

      {/* ─── Sortable list ─── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleProductos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {visibleProductos.map((p, i) => {
              // Encuentra el index real global para mostrar el número de posición absoluto
              const globalIndex = productos.findIndex(gp => gp.id === p.id);
              return (
                <SortableProductRow
                  key={p.id}
                  producto={p}
                  index={globalIndex}
                  categorias={categorias}
                />
              );
            })}
            {visibleProductos.length === 0 && (
              <div className="py-12 text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl border-dashed">
                No hay productos en esta categoría.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
