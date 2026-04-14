'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { CategoriaConfig } from '@prisma/client';

interface Props {
  initialCategorias: CategoriaConfig[];
  countMap: Record<string, number>;
}

// ─── Emoji Picker (simple inline) ────────────────────────────────────────────
const EMOJIS = ['🐔','🍗','🫀','🌭','🥚','📦','🥩','🍖','🥓','🧆','🍳','🛒','⭐','🔥','✨','🎯','🏷️','🆕','💯','🐓'];

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableRow({
  cat,
  count,
  onEdit,
  onDelete,
  onToggle,
}: {
  cat: CategoriaConfig;
  count: number;
  onEdit: (cat: CategoriaConfig) => void;
  onDelete: (cat: CategoriaConfig) => void;
  onToggle: (cat: CategoriaConfig) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm ${
        !cat.activo ? 'opacity-60' : ''
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none select-none"
        title="Arrastrar para reordenar"
      >
        ⠿
      </div>

      {/* Color swatch + emoji */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: cat.color + '33' }}
      >
        {cat.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{cat.nombre}</p>
        <p className="text-xs text-gray-400 truncate font-mono">{cat.slug}</p>
      </div>

      {/* Products count */}
      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
        {count} producto{count !== 1 ? 's' : ''}
      </span>

      {/* Active toggle */}
      <label className="toggle flex-shrink-0" title={cat.activo ? 'Desactivar' : 'Activar'}>
        <input
          type="checkbox"
          checked={cat.activo}
          onChange={() => onToggle(cat)}
        />
        <span className="toggle-track"><span className="toggle-thumb" /></span>
      </label>

      {/* Edit */}
      <button
        onClick={() => onEdit(cat)}
        className="btn-secondary px-2.5 py-1.5 text-xs flex-shrink-0"
      >
        ✏️
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(cat)}
        disabled={count > 0}
        title={count > 0 ? `No se puede eliminar: ${count} productos la usan` : 'Eliminar'}
        className="btn-danger px-2.5 py-1.5 text-xs flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🗑️
      </button>
    </div>
  );
}

// ─── Modal Form ─────────────────────────────────────────────────────────────────
interface ModalState {
  open: boolean;
  mode: 'create' | 'edit';
  cat?: CategoriaConfig;
}

function CategoriaModal({
  state,
  onClose,
  onSave,
}: {
  state: ModalState;
  onClose: () => void;
  onSave: (data: Partial<CategoriaConfig>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    nombre: state.cat?.nombre ?? '',
    slug:   state.cat?.slug   ?? '',
    emoji:  state.cat?.emoji  ?? '📦',
    color:  state.cat?.color  ?? '#f97316',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    setForm({
      nombre: state.cat?.nombre ?? '',
      slug:   state.cat?.slug   ?? '',
      emoji:  state.cat?.emoji  ?? '📦',
      color:  state.cat?.color  ?? '#f97316',
    });
    setError('');
  }, [state]);

  // Auto-generate slug from nombre (create only)
  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nombre = e.target.value;
    setForm((prev) => ({
      ...prev,
      nombre,
      slug: state.mode === 'create'
        ? nombre.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').slice(0, 30)
        : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, id: state.cat?.id });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold text-gray-900 mb-5">
          {state.mode === 'create' ? '➕ Nueva Categoría' : '✏️ Editar Categoría'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="label">Nombre *</label>
            <input
              type="text" required value={form.nombre}
              onChange={handleNombreChange}
              className="input" placeholder="Ej: Pollo Entero"
            />
          </div>

          {/* Slug (readonly on edit) */}
          <div>
            <label className="label">
              Slug (identificador)
              {state.mode === 'edit' && (
                <span className="ml-1 text-xs font-normal text-gray-400">— no editable</span>
              )}
            </label>
            <input
              type="text" value={form.slug} readOnly={state.mode === 'edit'}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className={`input font-mono text-sm ${state.mode === 'edit' ? 'bg-gray-50 text-gray-400' : ''}`}
              placeholder="POLLO_ENTERO"
            />
          </div>

          {/* Emoji + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Emoji</label>
              <div className="grid grid-cols-5 gap-1.5 p-2 border border-gray-200 rounded-xl bg-gray-50">
                {EMOJIS.map((em) => (
                  <button
                    key={em} type="button"
                    onClick={() => setForm((p) => ({ ...p, emoji: em }))}
                    className={`text-xl rounded-lg p-1 transition-all ${
                      form.emoji === em ? 'bg-brand-100 ring-2 ring-brand-400' : 'hover:bg-gray-200'
                    }`}
                  >
                    {em}
                  </button>
                ))}
                {/* Custom emoji input */}
                <input
                  type="text" maxLength={2}
                  value={EMOJIS.includes(form.emoji) ? '' : form.emoji}
                  onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value || p.emoji }))}
                  placeholder="+"
                  className="text-center text-sm border border-gray-300 rounded-lg p-1 col-span-2 focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Seleccionado: {form.emoji}</p>
            </div>

            <div>
              <label className="label">Color del badge</label>
              <div className="flex items-center gap-2">
                <input
                  type="color" value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="w-12 h-10 rounded-xl cursor-pointer border-0 p-0.5 bg-transparent"
                />
                <input
                  type="text" value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="input flex-1 font-mono text-sm"
                  placeholder="#f97316"
                />
              </div>
              {/* Preview */}
              <div
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: form.color }}
              >
                {form.emoji} {form.nombre || 'Vista previa'}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? '⟳ Guardando...' : state.mode === 'create' ? '✅ Crear Categoría' : '💾 Guardar'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────
export default function CategoriaManager({ initialCategorias, countMap }: Props) {
  const router = useRouter();
  const [cats, setCats] = useState<CategoriaConfig[]>(initialCategorias);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' });
  const [saving, setSaving] = useState(false);
  const catsRef = useRef(cats);
  useEffect(() => { catsRef.current = cats; }, [cats]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const arr = [...catsRef.current];
    const from = arr.findIndex((c) => c.id === active.id);
    const to   = arr.findIndex((c) => c.id === over.id);
    if (from === -1 || to === -1) return;

    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    const reordered = arr.map((c, i) => ({ ...c, orden: i }));
    setCats(reordered);
    catsRef.current = reordered;

    // Persist
    await fetch('/api/admin/categorias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered.map((c) => ({ id: c.id, orden: c.orden }))),
    });
  }

  async function handleToggle(cat: CategoriaConfig) {
    const updated = cats.map((c) =>
      c.id === cat.id ? { ...c, activo: !c.activo } : c,
    );
    setCats(updated);
    await fetch(`/api/admin/categorias/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: cat.nombre, emoji: cat.emoji, color: cat.color, activo: !cat.activo,
      }),
    });
    router.refresh();
  }

  async function handleDelete(cat: CategoriaConfig) {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/categorias/${cat.id}`, { method: 'DELETE' });
    if (res.ok) {
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message ?? 'Error al eliminar.');
    }
  }

  async function handleSave(data: Partial<CategoriaConfig>) {
    if (modal.mode === 'create') {
      const res = await fetch('/api/admin/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al crear.');
      }
      const newCat = await res.json();
      setCats((prev) => [...prev, newCat]);
    } else {
      const res = await fetch(`/api/admin/categorias/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al actualizar.');
      }
      const updatedCat = await res.json();
      setCats((prev) => prev.map((c) => c.id === updatedCat.id ? updatedCat : c));
    }
    router.refresh();
  }

  return (
    <>
      <CategoriaModal
        state={modal}
        onClose={() => setModal({ open: false, mode: 'create' })}
        onSave={handleSave}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {cats.length} categor{cats.length !== 1 ? 'ías' : 'ía'} · Arrastrá para reordenar
        </p>
        <button
          onClick={() => setModal({ open: true, mode: 'create' })}
          className="btn-primary"
        >
          ➕ Nueva Categoría
        </button>
      </div>

      {/* List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cats.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {cats.map((cat) => (
              <SortableRow
                key={cat.id}
                cat={cat}
                count={countMap[cat.slug] ?? 0}
                onEdit={(c) => setModal({ open: true, mode: 'edit', cat: c })}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {cats.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <span className="text-4xl block mb-2">📭</span>
          <p>No hay categorías. ¡Creá la primera!</p>
        </div>
      )}
    </>
  );
}
