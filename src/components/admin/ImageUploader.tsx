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
      className="absolute inset-0 z-40 flex flex-col bg-black/90 rounded-xl p-3 gap-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Live Preview */}
      <div className="relative flex-1 rounded-lg overflow-hidden bg-gray-900 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt="preview"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={framingToStyle({ x, y, zoom })}
        />
        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[1px] h-full bg-white/20" />
          <div className="absolute w-full h-[1px] bg-white/20" />
          <div className="w-4 h-4 rounded-full border-2 border-white/70 bg-transparent" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-1.5">
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px] w-7 shrink-0">🔍</span>
          <input
            type="range" min={1} max={2.5} step={0.05}
            value={zoom}
            onChange={(e) => { const v = parseFloat(e.target.value); setZoom(v); apply(x, y, v); }}
            className="flex-1 accent-brand-400 h-1.5 rounded-full cursor-pointer"
          />
          <span className="text-white/60 text-[10px] w-7 text-right shrink-0">{zoom.toFixed(2)}×</span>
        </div>

        {/* X axis */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px] w-7 shrink-0">↔️</span>
          <input
            type="range" min={0} max={100} step={1}
            value={x}
            onChange={(e) => { const v = parseInt(e.target.value); setX(v); apply(v, y, zoom); }}
            className="flex-1 accent-brand-400 h-1.5 rounded-full cursor-pointer"
          />
          <span className="text-white/60 text-[10px] w-7 text-right shrink-0">{x}%</span>
        </div>

        {/* Y axis */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[10px] w-7 shrink-0">↕️</span>
          <input
            type="range" min={0} max={100} step={1}
            value={y}
            onChange={(e) => { const v = parseInt(e.target.value); setY(v); apply(x, v, zoom); }}
            className="flex-1 accent-brand-400 h-1.5 rounded-full cursor-pointer"
          />
          <span className="text-white/60 text-[10px] w-7 text-right shrink-0">{y}%</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex-1 text-[11px] font-bold py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
        >
          🔄 Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 text-[11px] font-bold py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        >
          ✅ Listo
        </button>
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

// ─── Convert any format → WebP with canvas compression ───────────────────────
async function processImage(file: File): Promise<File> {
  let work = file;

  // HEIC/HEIF → JPEG conversion (canvas can't decode HEIC natively)
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (isHeic) {
    const heic2any = (await import('heic2any')).default;
    const blob = (await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.82,
    })) as Blob;
    work = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' },
    );
  }

  // Canvas → WebP (near-lossless, 60-80% smaller than JPEG)
  const bitmap = await createImageBitmap(work);
  const canvas = document.createElement('canvas');

  // Reducción drástica a MAX = 1024 para acelerar los payloads de la base de datos (PostgreSQL/Neon)
  const MAX = 1024;
  let { width, height } = bitmap;
  if (width > MAX || height > MAX) {
    if (width > height) {
      height = Math.round((height * MAX) / width);
      width = MAX;
    } else {
      width = Math.round((width * MAX) / height);
      height = MAX;
    }
  }
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), 'image/webp', 0.80),
  );

  return new File(
    [blob],
    `${work.name.replace(/\.[^.]+$/, '')}.webp`,
    { type: 'image/webp' },
  );
}

// ─── Main Uploader ─────────────────────────────────────────────────────────────
export default function ImageUploader({ images, onChange, maxImages = 8 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Keep a ref that always holds the latest images array so async upload
  // callbacks can safely read and update it without stale closures.
  const imagesRef = useRef<UploadedImage[]>(images);
  useEffect(() => { imagesRef.current = images; }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url as string;
  }

  const processAndUpload = useCallback(
    async (files: FileList | File[]) => {
      const current = imagesRef.current;
      const slots = maxImages - current.length;
      if (slots <= 0) return;

      const incoming = Array.from(files).slice(0, slots);
      if (!incoming.length) return;

      // Create placeholders immediately (shows spinners)
      const placeholders: UploadedImage[] = incoming.map((f) => ({
        id: `tmp-${crypto.randomUUID()}`,
        url: URL.createObjectURL(f),
        uploaded: false,
      }));

      const withPlaceholders = [...imagesRef.current, ...placeholders];
      imagesRef.current = withPlaceholders;
      onChange(withPlaceholders);

      // Process + upload each file in parallel
      await Promise.all(
        incoming.map(async (file, i) => {
          const ph = placeholders[i];
          try {
            const processed = await processImage(file);
            const url = await uploadFile(processed);
            // Swap placeholder with real URL using the ref for fresh state
            const updated = imagesRef.current.map((img) =>
              img.id === ph.id ? { ...img, url, uploaded: true } : img,
            );
            imagesRef.current = updated;
            onChange(updated);
          } catch (err) {
            console.error('Error al procesar imagen:', err);
            const cleaned = imagesRef.current.filter((img) => img.id !== ph.id);
            imagesRef.current = cleaned;
            onChange(cleaned);
          }
        }),
      );
    },
    [maxImages, onChange],
  );

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) processAndUpload(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) processAndUpload(e.dataTransfer.files);
  }

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
    <div 
      className={`flex flex-col gap-4 p-2 rounded-2xl transition-all ${
        dragOver ? 'bg-brand-50 border-2 border-dashed border-brand-400 scale-[1.01] shadow-inner' : 'border-2 border-transparent'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* ── Grid of uploaded / uploading images ─────────────────────── */}
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

              {/* "+ Agregar" slot */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50 transition-all font-medium"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-[11px]">Agregar</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Drop zone (empty state) ─────────────────────────────────── */}
      {images.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all group"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-5xl shadow-sm group-hover:scale-110 group-hover:bg-white transition-transform">
            📸
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-gray-800">Arrastrá fotos aquí o hacé clic</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              JPG, PNG, WebP o HEIC. Se optimizarán automáticamente.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm group-hover:border-brand-300 group-hover:text-brand-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Elegir Archivos
            </div>
          </div>
        </div>
      )}

      {/* ── Helper text ─────────────────────────────────────────────── */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          🖱️ Arrastrá para reordenar · La primera es la{' '}
          <strong className="text-gray-600">portada</strong> · Hover → ✂️ para ajustar encuadre · Máx {maxImages} fotos
        </p>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
