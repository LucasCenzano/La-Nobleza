'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ImageFraming {
  x: number;   // 0–100, default 50 (object-position-x)
  y: number;   // 0–100, default 50 (object-position-y)
  zoom: number; // 1.0–2.5, default 1 (css scale on object-fit: cover)
}

export interface UploadedImage {
  id: string;
  url: string;
  uploaded: boolean;
  framing?: ImageFraming;
}

interface Props {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

// ─── Default framing ─────────────────────────────────────────────────────────
function defaultFraming(): ImageFraming {
  return { x: 50, y: 50, zoom: 1 };
}

// ─── Build CSS style for a framed image ──────────────────────────────────────
export function framingToStyle(framing?: ImageFraming): React.CSSProperties {
  const f = framing ?? defaultFraming();
  return {
    objectFit: 'cover',
    objectPosition: `${f.x}% ${f.y}%`,
    transform: f.zoom !== 1 ? `scale(${f.zoom})` : undefined,
    transformOrigin: `${f.x}% ${f.y}%`,
  };
}

// ─── Framing Editor Panel ─────────────────────────────────────────────────────
function FramingEditor({
  img,
  onUpdate,
  onClose,
}: {
  img: UploadedImage;
  onUpdate: (id: string, framing: ImageFraming) => void;
  onClose: () => void;
}) {
  const f = img.framing ?? defaultFraming();
  const [x, setX] = useState(f.x);
  const [y, setY] = useState(f.y);
  const [zoom, setZoom] = useState(f.zoom);

  function apply(nx: number, ny: number, nz: number) {
    onUpdate(img.id, { x: nx, y: ny, zoom: nz });
  }

  function reset() {
    setX(50); setY(50); setZoom(1);
    onUpdate(img.id, defaultFraming());
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-gray-900 leading-tight">Encuadre de Foto</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ajustar Zoom y Posición</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live Preview - Large */}
        <div className="px-8 pb-4">
          <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100 border-4 border-gray-50 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt="preview"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={framingToStyle({ x, y, zoom })}
            />
            {/* Crosshair overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-[1px] h-full bg-white" />
              <div className="absolute w-full h-[1px] bg-white" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-transparent" />
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                Vista Previa
              </span>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="px-8 pb-10 flex flex-col gap-6">
          <div className="bg-gray-50 rounded-3xl p-6 flex flex-col gap-5 border border-gray-100">
            {/* Zoom Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-sm">🔍</span> Zoom
                </label>
                <span className="text-[13px] font-black text-brand-600">{zoom.toFixed(2)}×</span>
              </div>
              <input
                type="range" min={1} max={2.5} step={0.05}
                value={zoom}
                onChange={(e) => { const v = parseFloat(e.target.value); setZoom(v); apply(x, y, v); }}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-brand-500 cursor-pointer"
              />
            </div>

            {/* Horizontal Axis */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-sm">↔️</span> Horizontal
                </label>
                <span className="text-[13px] font-black text-gray-600">{x}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={x}
                onChange={(e) => { const v = parseInt(e.target.value); setX(v); apply(v, y, zoom); }}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-gray-500 cursor-pointer"
              />
            </div>

            {/* Vertical Axis */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-sm">↕️</span> Vertical
                </label>
                <span className="text-[13px] font-black text-gray-600">{y}%</span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={y}
                onChange={(e) => { const v = parseInt(e.target.value); setY(v); apply(x, v, zoom); }}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-gray-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all"
            >
              🔄 Restaurar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl bg-[var(--black-charcoal)] text-white font-bold text-sm shadow-lg shadow-black/20 hover:translate-y-[-2px] active:scale-95 transition-all"
            >
              ✅ Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Image Card ───────────────────────────────────────────────────────
function SortableImageCard({
  img,
  index,
  totalImages,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onUpdateFraming,
}: {
  img: UploadedImage;
  index: number;
  totalImages: number;
  onRemove: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onUpdateFraming: (id: string, framing: ImageFraming) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.id });
  const [editingFraming, setEditingFraming] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : ('auto' as const),
  };

  const isCover = index === 0;
  const hasCustomFraming = img.framing && (
    img.framing.x !== 50 || img.framing.y !== 50 || img.framing.zoom !== 1
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 bg-gray-100 aspect-square select-none ${
        isCover
          ? 'border-brand-500 ring-2 ring-brand-300'
          : 'border-gray-200'
      }`}
    >
      {/* Framing Editor overlay */}
      {editingFraming && img.uploaded && (
        <FramingEditor
          img={img}
          onUpdate={onUpdateFraming}
          onClose={() => setEditingFraming(false)}
        />
      )}

      {/* Drag handle — covers whole card (only when not editing) */}
      {!editingFraming && (
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Image */}
      {img.uploaded ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={`Foto ${index + 1}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={framingToStyle(img.framing)}
          />
        </div>
      ) : (
        // objectURL preview while still uploading
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.url}
          alt={`Foto ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Spinner overlay while uploading */}
      {!img.uploaded && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 pointer-events-none">
          <svg className="animate-spin w-7 h-7 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {/* Cover badge */}
      {isCover && img.uploaded && !editingFraming && (
        <span className="absolute bottom-1 left-1 z-20 text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-md leading-none pointer-events-none">
          PORTADA
        </span>
      )}

      {/* Custom framing indicator */}
      {hasCustomFraming && !editingFraming && (
        <span className="absolute bottom-1 right-1 z-20 text-[9px] font-bold bg-amber-500 text-white px-1 py-0.5 rounded leading-none pointer-events-none">
          ✂️
        </span>
      )}

      {/* ── Framing adjust button ── */}
      {img.uploaded && !editingFraming && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setEditingFraming(true); }}
          className="absolute top-1 left-1 z-30 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-[11px] hover:bg-amber-500 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Ajustar encuadre"
          title="Ajustar encuadre / zoom"
        >
          ✂️
        </button>
      )}

      {/* ── Native UI Reorder Buttons ── */}
      {img.uploaded && totalImages > 1 && !editingFraming && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-1 z-30 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveLeft(img.id); }}
            disabled={index === 0}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 disabled:opacity-0 active:scale-95 shadow-md"
            aria-label="Mover a la izquierda"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveRight(img.id); }}
            disabled={index === totalImages - 1}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 disabled:opacity-0 active:scale-95 shadow-md"
            aria-label="Mover a la derecha"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}

      {/* Remove button — visible on hover */}
      {!editingFraming && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
          className="absolute top-1 right-1 z-30 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Eliminar imagen"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function ImageUploader({ images, onChange, maxImages = 8 }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleRemove(id: string) {
    const updated = images.filter((img) => img.id !== id);
    onChange(updated);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const arr = [...images];
    const from = arr.findIndex((i) => i.id === active.id);
    const to = arr.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;

    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onChange(arr);
  }

  function handleMoveManual(id: string, dir: -1 | 1) {
    const arr = [...images];
    const idx = arr.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    
    // Swap
    const temp = arr[idx];
    arr[idx] = arr[to];
    arr[to] = temp;
    onChange(arr);
  }

  function handleUpdateFraming(id: string, framing: ImageFraming) {
    const updated = images.map((img) =>
      img.id === id ? { ...img, framing } : img,
    );
    onChange(updated);
  }

  const canAddMore = images.length < maxImages;

  return (
    <div className="flex flex-col gap-4 p-2 rounded-2xl border-2 border-transparent">
      {/* ── Grid of images ─────────────────────── */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <SortableImageCard
                  key={img.id}
                  img={img}
                  index={idx}
                  totalImages={images.length}
                  onRemove={handleRemove}
                  onMoveLeft={(id) => handleMoveManual(id, -1)}
                  onMoveRight={(id) => handleMoveManual(id, 1)}
                  onUpdateFraming={handleUpdateFraming}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Empty state ─────────────────────────────────── */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-gray-50/30">
          <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-5xl shadow-sm border border-gray-100">
            🔗
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-gray-800">No hay fotos en este producto</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Pegá el link (URL) de una imagen externa abajo para empezar.
            </p>
          </div>
        </div>
      )}

      {/* Helper text */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          🖱️ Arrastrá para reordenar · La primera es la{' '}
          <strong className="text-gray-600">portada</strong> · Hover → ✂️ para ajustar encuadre · Máx {maxImages} fotos
        </p>
      )}

      {/* External URL Input */}
      {canAddMore && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="url"
            placeholder="Pegá una URL externa (ej: https://...)"
            className="flex-1 text-sm rounded-xl border-gray-200 focus:ring-brand-500 focus:border-brand-500 py-3 px-4 shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val && val.startsWith('http')) {
                  const newImg: UploadedImage = {
                    id: `ext-${crypto.randomUUID()}`,
                    url: val,
                    uploaded: true,
                  };
                  onChange([...images, newImg]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <button
            type="button"
            className="bg-[var(--black-charcoal)] hover:bg-black text-white font-bold px-5 py-3 rounded-xl whitespace-nowrap active:scale-95 transition-all shadow-md"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              const val = input.value.trim();
              if (val && val.startsWith('http')) {
                const newImg: UploadedImage = {
                  id: `ext-${crypto.randomUUID()}`,
                  url: val,
                  uploaded: true,
                };
                onChange([...images, newImg]);
                input.value = '';
              }
            }}
          >
            Añadir URL
          </button>
        </div>
      )}
    </div>
  );
}
