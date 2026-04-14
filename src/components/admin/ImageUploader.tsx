'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
export interface UploadedImage {
  id: string;
  url: string;
  uploaded: boolean;
}

interface Props {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

// ─── Sortable Image Card ───────────────────────────────────────────────────────
function SortableImageCard({
  img,
  index,
  onRemove,
}: {
  img: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : ('auto' as const),
  };

  const isCover = index === 0;

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
      {/* Drag handle — covers whole card */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
      />

      {/* Image */}
      {img.uploaded ? (
        <Image
          src={img.url}
          alt={`Foto ${index + 1}`}
          fill
          className="object-cover pointer-events-none"
          sizes="160px"
        />
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
      {isCover && img.uploaded && (
        <span className="absolute bottom-1 left-1 z-20 text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-md leading-none pointer-events-none">
          PORTADA
        </span>
      )}

      {/* Remove button — visible on hover */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
        className="absolute top-1 right-1 z-30 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Eliminar imagen"
      >
        ✕
      </button>
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
      quality: 0.95,
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

  const MAX = 1600;
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
    canvas.toBlob((b) => res(b!), 'image/webp', 0.88),
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

  const canAddMore = images.length < maxImages;

  return (
    <div className="flex flex-col gap-3">
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
                  onRemove={handleRemove}
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
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl">
            📷
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Arrastrá fotos aquí o hacé clic</p>
            <p className="text-xs text-gray-400 mt-1">
              JPG · PNG · WebP · HEIC — se convierten a WebP automáticamente
            </p>
            <p className="text-xs text-gray-400">Máximo {maxImages} fotos por producto</p>
          </div>
          <span className="text-sm text-brand-600 font-semibold underline underline-offset-2">
            Elegir archivos
          </span>
        </div>
      )}

      {/* ── Helper text ─────────────────────────────────────────────── */}
      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          🖱️ Arrastrá para reordenar · La primera es la{' '}
          <strong className="text-gray-600">portada</strong> · Máx {maxImages} fotos
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
