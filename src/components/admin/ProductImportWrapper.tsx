'use client';

import { useState } from 'react';
import ProductImportModal from './ProductImportModal';
import { useRouter } from 'next/navigation';

export default function ProductImportWrapper({ categorias, productos }: { categorias: any[], productos: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn-secondary flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importar Excel
      </button>

      <ProductImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categorias={categorias}
        productosExistentes={productos}
        onImportSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
