import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import ProductTable from '@/components/admin/ProductTable';

export const dynamic = 'force-dynamic';

export default async function AdminProductosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const productos = await prisma.producto.findMany({
    orderBy: [{ activo: 'desc' }, { categoria: 'asc' }, { nombre: 'asc' }],
  });

  const activos  = productos.filter((p) => p.activo).length;
  const pausados = productos.length - activos;

  return (
    <>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {productos.length} productos ·{' '}
              <span className="text-green-600 font-medium">{activos} activos</span>
              {pausados > 0 && (
                <> · <span className="text-amber-600 font-medium">{pausados} pausados</span></>
              )}
            </p>
          </div>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            ➕ Nuevo Producto
          </Link>
        </div>

        {/* Stats chips */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total', value: productos.length, color: 'bg-gray-100 text-gray-700' },
            { label: 'Activos', value: activos, color: 'bg-green-100 text-green-700' },
            { label: 'Pausados', value: pausados, color: 'bg-amber-100 text-amber-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl px-4 py-3 text-center`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <ProductTable productos={productos} />
      </main>
    </>
  );
}
