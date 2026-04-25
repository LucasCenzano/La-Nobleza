'use client';

import { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import { Producto } from '@prisma/client';

interface ProductEditDrawerProps {
  producto: any | null;
  isOpen:   boolean;
  onClose:  () => void;
  onUpdate: (id: string, updatedProduct: any) => void;
}

export default function ProductEditDrawer({ producto, isOpen, onClose, onUpdate }: ProductEditDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel Lateral */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-4xl bg-gray-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Producto</h2>
            <p className="text-xs text-gray-500 font-medium">Panel de Edición Rápida</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {producto && (
            <ProductForm 
              mode="edit" 
              initialData={producto} 
              onSuccess={(updated) => {
                onUpdate(producto.id, updated);
                onClose();
              }}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
