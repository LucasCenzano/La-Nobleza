import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';

interface EditarProductoPageProps {
  params: { id: string };
}

export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const producto = await prisma.producto.findUnique({
    where: { id: params.id },
  });

  if (!producto) notFound();

  return (
    <>
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Los cambios se reflejarán inmediatamente en el catálogo público.
          </p>
        </div>

        <div className="card p-6">
          <ProductForm mode="edit" initialData={producto} />
        </div>
      </main>
    </>
  );
}
