import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/AdminNav';
import CategoriaManager from '@/components/admin/CategoriaManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const categorias = await prisma.categoriaConfig.findMany({
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  });

  // Count products per category
  const counts = await prisma.producto.groupBy({
    by: ['categoria'],
    _count: { id: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.categoria, c._count.id]),
  );

  return (
    <>
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Gestión de Categorías
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Creá, editá y reordenás las categorías del catálogo. Arrastrá para cambiar el orden.
          </p>
        </div>

        <CategoriaManager initialCategorias={categorias} countMap={countMap} />
      </main>
    </>
  );
}
