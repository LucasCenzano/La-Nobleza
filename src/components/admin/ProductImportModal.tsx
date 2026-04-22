'use client';

import { useState, useRef } from 'react';
import * as xlsx from 'xlsx';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  categorias: any[];
}

export default function ProductImportModal({ isOpen, onClose, onImportSuccess, categorias }: ProductImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = xlsx.utils.sheet_to_json(sheet);
        
        // Formatear columnas a minúsculas para un mapeo más fácil
        const formattedData = parsedData.map((row: any) => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key.toLowerCase().trim()] = row[key];
          }
          return newRow;
        });

        setPreview(formattedData);
      } catch (err) {
        setError('Error al leer el archivo Excel. Asegúrate de que el formato sea correcto.');
        setPreview([]);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('No hay productos para importar.');
      return;
    }

    setLoading(true);
    setError('');

    // Mapear al formato que espera el backend
    const productosParaEnviar = preview.map((p) => {
      // Buscar categoría por nombre o slug, default a la primera o 'OTROS'
      let categoriaSlug = 'OTROS';
      if (p.categoria) {
        const catStr = String(p.categoria).toLowerCase().trim();
        const found = categorias.find(c => 
          c.nombre.toLowerCase().trim() === catStr || 
          c.slug.toLowerCase().trim() === catStr
        );
        if (found) {
          categoriaSlug = found.slug;
        } else if (categorias.length > 0) {
           categoriaSlug = categorias[0].slug;
        }
      }

      return {
        nombre: p.nombre || 'Producto sin nombre',
        descripcion: p.descripcion || '',
        precio: Number(p.precio) || 0,
        categoria: categoriaSlug,
        tipoVenta: String(p.tipoventa || p['tipo de venta'] || p.unidad || '').toUpperCase() === 'PESO' ? 'PESO' : 'UNIDAD',
        stock: p.stock !== undefined && p.stock !== '' ? Number(p.stock) : null,
        activo: true,
      };
    });

    try {
      const res = await fetch('/api/admin/productos/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productos: productosParaEnviar }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al importar');
      }

      onImportSuccess();
      onClose();
      // Reset state
      setFile(null);
      setPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      {
        nombre: 'Pollo Entero',
        precio: 5000,
        categoria: 'Pollo Entero',
        descripcion: 'Pollo fresco por kg',
        tipoVenta: 'PESO',
        stock: 50
      },
      {
        nombre: 'Pata Muslo x 3kg',
        precio: 12000,
        categoria: 'Combos',
        descripcion: 'Oferta 3kg',
        tipoVenta: 'UNIDAD',
        stock: ''
      }
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Productos');
    xlsx.writeFile(wb, 'Plantilla_Productos.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">Importar Productos desde Excel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-gray-900 font-medium mb-1">1. Descarga la plantilla</h3>
              <p className="text-sm text-gray-500">Usa este archivo como base para cargar tus productos.</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border border-gray-200"
            >
              Descargar Plantilla
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-900 font-medium mb-2">2. Sube tu archivo Excel</h3>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-brand-600">Haz clic para subir</span> o arrastra y suelta</p>
                <p className="text-xs text-gray-400">.xlsx, .xls, .csv</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
            {file && <p className="mt-2 text-sm text-green-600 font-medium">Archivo seleccionado: {file.name}</p>}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-medium mb-2">3. Previsualización ({preview.length} productos)</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.nombre}</td>
                        <td className="px-4 py-3">${row.precio}</td>
                        <td className="px-4 py-3">
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md font-medium">
                            {row.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{row.tipoventa || row.unidad || 'UNIDAD'}</td>
                        <td className="px-4 py-3 font-medium">{row.stock !== undefined ? row.stock : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 10 && (
                <p className="text-xs text-gray-500 mt-3 text-center font-medium">Mostrando 10 de {preview.length} productos...</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={preview.length === 0 || loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: preview.length === 0 || loading ? undefined : '#f97316' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importando...
              </>
            ) : (
              'Confirmar e Importar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
