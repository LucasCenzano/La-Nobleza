'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Producto } from '@prisma/client';
import ProductTable from './ProductTable';
import ProductFiltersClient from './ProductFiltersClient';
import ProductImportWrapper from './ProductImportWrapper';
import { CategoriaConfigType } from '@/lib/constants';

type ProductoExtended = Producto & {
  imagenesUrls?: string[];
  etiquetas?:    string[];
  precioOferta?: number | null;
};

interface Props {
  initialProductos: ProductoExtended[];
  categorias:       CategoriaConfigType[];
}

export default function ProductManagerClient({ initialProductos, categorias }: Props) {
  const [allProductos, setAllProductos] = useState<ProductoExtended[]>(initialProductos);
  // ─── Filter State ──────────────────────────────────────────────
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [sort, setSort] = useState('');

  // ─── Computed Filtering ────────────────────────────────────────
  const filteredProductos = useMemo(() => {
    let result = [...allProductos];

    if (q) {
      const search = q.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(search) || 
        p.descripcion?.toLowerCase().includes(search)
      );
    }

    if (categoria) {
      result = result.filter(p => p.categoria === categoria);
    }

    if (etiqueta) {
      result = result.filter(p => p.etiquetas?.includes(etiqueta));
    }

    if (estado === 'activos') {
      result = result.filter(p => p.activo);
    } else if (estado === 'pausados') {
      result = result.filter(p => !p.activo);
    } else if (estado === 'sin_foto') {
      result = result.filter(p => !p.imagenUrl && (!p.imagenesUrls || p.imagenesUrls.length === 0));
    } else if (estado === 'en_oferta') {
      result = result.filter(p => !!p.precioOferta && p.precioOferta > 0);
    }

    // Sort
    switch (sort) {
      case 'nombre_asc':  result.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'nombre_desc': result.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      case 'precio_asc':  result.sort((a, b) => (a.precioOferta || a.precio) - (b.precioOferta || b.precio)); break;
      case 'precio_desc': result.sort((a, b) => (b.precioOferta || b.precio) - (a.precioOferta || a.precio)); break;
      case 'fecha_desc':  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
      case 'fecha_asc':   result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()); break;
    }

    return result;
  }, [initialProductos, q, estado, categoria, etiqueta, sort]);

  // ─── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total:    allProductos.length,
      activos:  allProductos.filter(p => p.activo).length,
      pausados: allProductos.filter(p => !p.activo).length,
      sinFoto:  allProductos.filter(p => !p.imagenUrl && (!p.imagenesUrls || p.imagenesUrls.length === 0)).length,
      enOferta: allProductos.filter(p => !!p.precioOferta && p.precioOferta > 0).length,
    };
  }, [allProductos]);

  function onUpdateProduct(id: string, field: string, value: any) {
    setAllProductos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function onRemoveProducts(ids: string[]) {
    setAllProductos(prev => prev.filter(p => !ids.includes(p.id)));
  }

  const isFiltered = !!(q || estado || categoria || etiqueta);

  function clearAll() {
    setQ('');
    setEstado('');
    setCategoria('');
    setEtiqueta('');
    setSort('');
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {estado === 'activos' ? 'Productos Activos' : 
             estado === 'pausados' ? 'Productos Pausados' : 
             estado === 'sin_foto' ? 'Productos Sin Foto' : 
             estado === 'en_oferta' ? 'Productos en Oferta' : 
             categoria ? `Categoría: ${categoria}` : 
             'Gestión de Productos'}
          </h1>
          {isFiltered && (
            <p className="text-sm text-gray-500 mt-0.5">
              Mostrando {filteredProductos.length} de {stats.total} productos
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ProductImportWrapper categorias={categorias} productos={allProductos} />
          <Link href="/admin/productos/nuevo" className="btn-primary">
            ➕ Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Mini stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {[
          { label: 'Total',     value: stats.total,    active: !isFiltered && !estado, color: 'bg-gray-100 text-gray-700',   onClick: clearAll },
          { label: 'Activos',   value: stats.activos,  active: estado === 'activos',  color: 'bg-green-100 text-green-700', onClick: () => { clearAll(); setEstado('activos'); } },
          { label: 'Pausados',  value: stats.pausados, active: estado === 'pausados', color: 'bg-amber-100 text-amber-700', onClick: () => { clearAll(); setEstado('pausados'); } },
          { label: 'Sin foto',  value: stats.sinFoto,  active: estado === 'sin_foto', color: 'bg-blue-100 text-blue-700',   onClick: () => { clearAll(); setEstado('sin_foto'); } },
          { label: 'En oferta', value: stats.enOferta, active: estado === 'en_oferta',color: 'bg-red-100 text-red-700',     onClick: () => { clearAll(); setEstado('en_oferta'); } },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={chip.onClick}
            className={`${chip.color} rounded-xl px-3 py-2 text-center transition-all hover:shadow-sm hover:-translate-y-0.5 ${
              chip.active ? 'ring-2 ring-offset-1 ring-current shadow-sm' : ''
            }`}
          >
            <p className="text-xl font-bold tabular-nums">{chip.value}</p>
            <p className="text-[10px] font-semibold opacity-80">{chip.label}</p>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <ProductFiltersClient 
        categorias={categorias} 
        totalCount={filteredProductos.length}
        state={{ q, estado, categoria, etiqueta, sort }}
        setState={{ setQ, setEstado, setCategoria, setEtiqueta, setSort }}
        clearAll={clearAll}
      />

      {/* Table */}
      <ProductTable 
        productos={filteredProductos as any} 
        categorias={categorias} 
        onUpdate={onUpdateProduct}
        onRemove={onRemoveProducts}
      />
    </main>
  );
}
