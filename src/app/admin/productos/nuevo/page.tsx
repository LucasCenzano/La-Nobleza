import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';

export default async function NuevoProductoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  return (
    <>
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">Nuevo Producto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Completá los datos y el producto aparecerá inmediatamente en el catálogo.
          </p>
        </div>

        <div className="card p-6">
          <ProductForm mode="create" />
        </div>
      </main>
    </>
  );
}
