'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Producto } from '@prisma/client';
import { TIPO_VENTA_LABELS, formatPrecioSolo, getCategoriaLabel, CategoriaConfigType } from '@/lib/constants';
import { TipoVenta } from '@prisma/client';
import Image from 'next/image';
import EtiquetaBadge from '@/components/admin/EtiquetaBadge';
import ProductEditDrawer from '@/components/admin/ProductEditDrawer';

type ProductoExtended = Producto & {
  imagenesUrls?: string[];
  etiquetas?:    string[];
  precioOferta?: number | null;
};

interface ProductTableProps {
  productos:  ProductoExtended[];
  categorias: CategoriaConfigType[];
  onUpdate:   (id: string, field: string, value: any) => void;
  onRemove:   (ids: string[]) => void;
}

export default function ProductTable({ productos, categorias, onUpdate, onRemove }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('');
  const [isCompact, setIsCompact] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[], nombre?: string } | null>(null);
  
  // In-line editing state
  const [editing, setEditing] = useState<{ id: string, field: string } | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<ProductoExtended | null>(null);

  async function toggleActivo(id: string, currentValue: boolean) {
    const nextValue = !currentValue;
    onUpdate(id, 'activo', nextValue);

    await fetch(`/api/admin/productos/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ activo: nextValue }),
    });
  }

  async function handleBulkAction(action: 'ACTIVATE' | 'PAUSE' | 'DELETE' | 'CHANGE_CATEGORY' | 'ADJUST_PRICE' | 'TOGGLE_OFFER', data?: any) {
    if (selectedIds.length === 0) return;
    
    if (action === 'DELETE') {
      setConfirmDelete({ ids: selectedIds });
      return;
    }

    // Optimistic update
    if (action === 'ACTIVATE') selectedIds.forEach(id => onUpdate(id, 'activo', true));
    if (action === 'PAUSE')    selectedIds.forEach(id => onUpdate(id, 'activo', false));
    if (action === 'CHANGE_CATEGORY') selectedIds.forEach(id => onUpdate(id, 'categoria', data.categoria));
    
    if (action === 'ADJUST_PRICE') {
      const factor = 1 + (data.percentage / 100);
      selectedIds.forEach(id => {
        const p = productos.find(x => x.id === id);
        if (p) {
          onUpdate(id, 'precio', Math.round(p.precio * factor));
          if (p.precioOferta) onUpdate(id, 'precioOferta', Math.round(p.precioOferta * factor));
        }
      });
    }

    if (action === 'TOGGLE_OFFER') {
      selectedIds.forEach(id => {
        const p = productos.find(x => x.id === id);
        if (p) {
          const hasOffer = !!p.precioOferta && p.precioOferta > 0;
          // Si no tiene oferta, le ponemos una del -10% por defecto (pueden editarla después in-line)
          // Si tiene oferta, se la quitamos (null)
          onUpdate(id, 'precioOferta', hasOffer ? null : Math.round(p.precio * 0.9));
        }
      });
    }

    await fetch('/api/admin/productos/bulk-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, action, data }),
    });

    setSelectedIds([]);
    setIsBulkCategoryOpen(false);
    setIsBulkPriceOpen(false);
  }

  async function executeDelete() {
    if (!confirmDelete) return;
    
    onRemove(confirmDelete.ids);

    await fetch('/api/admin/productos/bulk-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: confirmDelete.ids, action: 'DELETE' }),
    });

    setConfirmDelete(null);
    setSelectedIds([]);
  }

  async function eliminarProducto(id: string, nombre: string) {
    setConfirmDelete({ ids: [id], nombre });
  }

  function toggleSelectAll() {
    if (selectedIds.length === productos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productos.map(p => p.id));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function saveInLine(id: string, field: string, value: any) {
    setEditing(null);
    
    // Si el valor no cambió, no hacemos nada
    const p = productos.find(x => x.id === id);
    if (p && (p as any)[field] === value) return;

    // Optimistic update
    onUpdate(id, field, value);

    await fetch(`/api/admin/productos/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ [field]: value }),
    });
  }

  const startEditing = (id: string, field: string, value: any) => {
    setEditing({ id, field });
    setTempValue(value);
  };

  function handleFullUpdate(id: string, updated: any) {
    // We iterate over the keys of the updated object and call onUpdate for each
    Object.keys(updated).forEach(key => {
      onUpdate(id, key, (updated as any)[key]);
    });
  }

  if (productos.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <span className="text-4xl block mb-2">📦</span>
        <p>No hay productos aún. ¡Creá el primero!</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left w-10`}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === productos.length && productos.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
              />
            </th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left text-xs font-semibold text-gray-500 uppercase tracking-wide`}>Producto</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell`}>Categoría</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left text-xs font-semibold text-gray-500 uppercase tracking-wide`}>Stock</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left text-xs font-semibold text-gray-500 uppercase tracking-wide`}>Precio</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell`}>Etiquetas</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-center text-xs font-semibold text-gray-500 uppercase tracking-wide`}>Activo</th>
            <th className={`px-4 ${isCompact ? 'py-1.5' : 'py-3'} text-right text-xs font-semibold text-gray-500 uppercase tracking-wide`}>
              <button 
                onClick={() => setIsCompact(!isCompact)}
                className={`p-1 rounded-md transition-colors ${isCompact ? 'bg-brand-100 text-brand-600' : 'text-gray-400 hover:bg-gray-100'}`}
                title={isCompact ? 'Vista normal' : 'Vista compacta'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 8h16M4 16h16"/></svg>
              </button>
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {productos.map((p) => {
            const thumbRaw     = p.imagenesUrls?.[0] || p.imagenUrl || null;
            const thumb        = thumbRaw ? thumbRaw.split('#framing:')[0] : null;
            const hasOferta    = !!p.precioOferta && p.precioOferta > 0 && p.precioOferta < p.precio;
            const catLabel    = getCategoriaLabel(p.categoria, categorias);

            return (
              <tr
                key={p.id}
                className={`transition-colors duration-150 ${
                  selectedIds.includes(p.id) ? 'bg-brand-50' : !p.activo ? 'opacity-50 bg-gray-50' : 'hover:bg-cream-50'
                }`}
              >
                {/* Checkbox */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelectOne(p.id)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                  />
                </td>
                {/* Name + thumbnail */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'}`}>
                  <div className="flex items-center gap-3">
                    {thumb ? (
                      <div className={`relative ${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg overflow-hidden flex-shrink-0 bg-cream-100 transition-all`}>
                        <Image src={thumb} alt={p.nombre} fill loading="lazy"
                          className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0 transition-all`}>
                        <span className={isCompact ? 'text-sm' : 'text-lg'}>🍗</span>
                      </div>
                    )}
                    {editing?.id === p.id && editing?.field === 'nombre' ? (
                      <input
                        autoFocus
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInLine(p.id, 'nombre', tempValue)}
                        onKeyDown={(e) => e.key === 'Enter' && saveInLine(p.id, 'nombre', tempValue)}
                        className="flex-1 bg-white border-2 border-brand-500 rounded-md px-2 py-1 text-sm outline-none shadow-inner"
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => startEditing(p.id, 'nombre', p.nombre)}
                        className={`font-medium text-gray-900 leading-tight cursor-edit hover:text-brand-600 transition-colors ${isCompact ? 'text-xs' : 'text-sm'}`}
                        title="Doble clic para editar"
                      >
                        {p.nombre}
                      </span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'} hidden sm:table-cell`}>
                  {editing?.id === p.id && editing?.field === 'categoria' ? (
                    <select
                      autoFocus
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); saveInLine(p.id, 'categoria', e.target.value); }}
                      onBlur={() => setEditing(null)}
                      className="bg-white border-2 border-brand-500 rounded-md px-1 py-1 text-xs outline-none"
                    >
                      {categorias.map(c => (
                        <option key={c.slug} value={c.slug}>{c.emoji} {c.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      onDoubleClick={() => startEditing(p.id, 'categoria', p.categoria)}
                      className={`badge-orange cursor-edit hover:bg-orange-200 transition-all ${isCompact ? 'px-1.5 py-0 text-[10px]' : ''}`}
                      title="Doble clic para cambiar categoría"
                    >
                      {catLabel}
                    </span>
                  )}
                </td>

                {/* Stock */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'}`}>
                  {editing?.id === p.id && editing?.field === 'stock' ? (
                    <input
                      autoFocus
                      type="number"
                      value={tempValue ?? ''}
                      onChange={(e) => setTempValue(e.target.value === '' ? null : parseFloat(e.target.value))}
                      onBlur={() => saveInLine(p.id, 'stock', tempValue)}
                      onKeyDown={(e) => e.key === 'Enter' && saveInLine(p.id, 'stock', tempValue)}
                      className="w-20 bg-white border-2 border-brand-500 rounded-md px-2 py-1 text-xs font-bold outline-none"
                    />
                  ) : (
                    <div onDoubleClick={() => startEditing(p.id, 'stock', p.stock)}>
                      {p.stock !== null && p.stock !== undefined ? (
                        <span className={`font-bold cursor-edit hover:text-brand-600 transition-colors ${isCompact ? 'text-xs' : ''} ${p.stock <= 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {p.stock} {p.tipoVenta === 'PESO' ? 'kg' : 'un.'}
                        </span>
                      ) : (
                        <span className={`text-gray-400 italic cursor-edit hover:text-brand-600 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>Ilimitado</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Price */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'} whitespace-nowrap`}>
                  {editing?.id === p.id && editing?.field === 'precio' ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">$</span>
                        <input
                          autoFocus
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(parseFloat(e.target.value))}
                          onBlur={() => saveInLine(p.id, 'precio', tempValue)}
                          onKeyDown={(e) => e.key === 'Enter' && saveInLine(p.id, 'precio', tempValue)}
                          className="w-24 bg-white border-2 border-brand-500 rounded-md px-2 py-1 text-sm font-bold outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div onDoubleClick={() => startEditing(p.id, 'precio', p.precio)}>
                      {hasOferta ? (
                        <div className={isCompact ? 'flex items-center gap-2' : ''}>
                          <p className={`text-gray-400 line-through leading-none cursor-edit ${isCompact ? 'text-[10px]' : 'text-xs mb-1'}`}>
                            {formatPrecioSolo(p.precio)}
                          </p>
                          <p className={`font-bold text-red-600 leading-tight cursor-edit ${isCompact ? 'text-xs' : 'text-sm'}`}>
                            {formatPrecioSolo(p.precioOferta!)}
                            {!isCompact && (
                              <span className="ml-1 text-[10px] font-semibold bg-red-100 text-red-600 px-1 py-0.5 rounded">
                                -{Math.round((1 - p.precioOferta! / p.precio) * 100)}%
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className={`font-semibold text-brand-700 cursor-edit hover:text-brand-900 transition-colors ${isCompact ? 'text-xs' : ''}`}>
                          {formatPrecioSolo(p.precio)}
                          {!isCompact && (
                            <span className="ml-1 text-xs font-normal text-gray-400">
                              {TIPO_VENTA_LABELS[p.tipoVenta as TipoVenta]}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Etiquetas */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'} hidden md:table-cell`}>
                  <div 
                    className="flex flex-wrap gap-1 cursor-edit min-h-[20px] min-w-[50px] hover:bg-gray-50 rounded p-1 transition-colors"
                    onDoubleClick={() => startEditing(p.id, 'etiquetas', p.etiquetas ?? [])}
                  >
                    {editing?.id === p.id && editing?.field === 'etiquetas' ? (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={() => saveInLine(p.id, 'etiquetas', tempValue)}>
                        <div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px]" onClick={e => e.stopPropagation()}>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Etiquetas</p>
                          <div className="flex flex-col gap-1">
                            {['NUEVO', 'DESTACADO', 'OFERTA', 'SIN_STOCK'].map(slug => {
                              const active = tempValue.includes(slug);
                              return (
                                <button
                                  key={slug}
                                  onClick={() => {
                                    const next = active ? tempValue.filter((s: string) => s !== slug) : [...tempValue, slug];
                                    setTempValue(next);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                  {active ? '✅' : '⬜'} {slug}
                                </button>
                              );
                            })}
                          </div>
                          <button 
                            onClick={() => saveInLine(p.id, 'etiquetas', tempValue)}
                            className="btn-primary py-2 text-xs"
                          >
                            Listo
                          </button>
                        </div>
                      </div>
                    ) : (
                      (p.etiquetas ?? []).length > 0
                        ? (p.etiquetas ?? []).map((slug) => (
                            <EtiquetaBadge key={slug} slug={slug} compact={isCompact} />
                          ))
                        : <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </td>

                {/* Toggle */}
                <td className="px-4 py-3 text-center">
                  <label className="toggle" title={p.activo ? 'Pausar' : 'Activar'}>
                    <input type="checkbox" checked={p.activo}
                      onChange={() => toggleActivo(p.id, p.activo)}
                      disabled={isPending} />
                    <span className="toggle-track"><span className="toggle-thumb" /></span>
                  </label>
                </td>

                {/* Actions */}
                <td className={`px-4 ${isCompact ? 'py-1' : 'py-3'} text-right`}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className={`btn-secondary px-3 ${isCompact ? 'py-1' : 'py-1.5'} text-xs`}>
                      ✏️ {!isCompact && 'Editar'}
                    </button>
                    <button
                      onClick={() => eliminarProducto(p.id, p.nombre)}
                      className={`btn-danger px-3 ${isCompact ? 'py-1' : 'py-1.5'} text-xs`}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-slide-up">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-3 flex items-center gap-4 min-w-[320px] sm:min-w-[450px]">
            <div className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <span className="bg-white/20 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{selectedIds.length}</span>
              Seleccionados
            </div>
            
            <div className="h-6 w-px bg-gray-100 mx-1"></div>
            
            <div className="flex flex-1 items-center gap-2 overflow-x-auto scroll-x-hide pb-0.5">
              <button 
                onClick={() => handleBulkAction('ACTIVATE')}
                className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap text-green-600 border-green-100 hover:bg-green-50"
              >
                ✅ Activar
              </button>
              <button 
                onClick={() => handleBulkAction('PAUSE')}
                className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap text-amber-600 border-amber-100 hover:bg-amber-50"
              >
                ⏸️ Pausar
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsBulkCategoryOpen(!isBulkCategoryOpen)}
                  className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap"
                >
                  🏷️ Cambiar Cat.
                </button>
                {isBulkCategoryOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Seleccionar destino</p>
                    {categorias.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleBulkAction('CHANGE_CATEGORY', { categoria: cat.slug })}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 text-xs text-gray-700 transition-colors"
                      >
                        {cat.emoji} {cat.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsBulkPriceOpen(true)}
                className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap text-brand-700 border-brand-100 hover:bg-brand-50"
              >
                💰 Ajustar %
              </button>

              <button 
                onClick={() => handleBulkAction('TOGGLE_OFFER')}
                className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap text-red-600 border-red-100 hover:bg-red-50"
              >
                🔥 Oferta
              </button>

              <button 
                onClick={() => handleBulkAction('DELETE')}
                className="btn-secondary py-1.5 px-3 text-xs whitespace-nowrap text-red-600 border-red-100 hover:bg-red-50"
              >
                🗑️ Eliminar
              </button>
            </div>

            <button 
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              title="Cancelar selección"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-pop-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2 leading-tight">
              {confirmDelete.nombre ? `¿Eliminar "${confirmDelete.nombre}"?` : `¿Eliminar ${confirmDelete.ids.length} productos?`}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Esta acción no se puede deshacer. Los productos seleccionados serán eliminados definitivamente del catálogo.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={executeDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
              >
                Eliminar definitivamente
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="w-full h-12 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Price Adjustment Modal */}
      {isBulkPriceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-pop-in">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              💰
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2 leading-tight">
              Ajustar Precios
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Se aplicará un cambio porcentual a los {selectedIds.length} productos seleccionados.
            </p>
            
            <div className="relative mb-8">
              <input
                autoFocus
                type="number"
                placeholder="+10"
                value={bulkPriceValue}
                onChange={(e) => setBulkPriceValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBulkAction('ADJUST_PRICE', { percentage: parseFloat(bulkPriceValue) })}
                className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 text-center text-2xl font-bold focus:border-brand-500 focus:bg-white outline-none transition-all"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300 pointer-events-none">%</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleBulkAction('ADJUST_PRICE', { percentage: parseFloat(bulkPriceValue) })}
                disabled={!bulkPriceValue}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 rounded-xl font-bold transition-colors shadow-lg shadow-brand-200"
              >
                Aplicar ajuste
              </button>
              <button
                onClick={() => { setIsBulkPriceOpen(false); setBulkPriceValue(''); }}
                className="w-full h-12 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Side Drawer Edit */}
      <ProductEditDrawer 
        producto={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdate={handleFullUpdate}
      />
    </>
  );
}
