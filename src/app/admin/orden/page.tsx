import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/AdminNav';
import OrdenCatalogo from '@/components/admin/OrdenCatalogo';

export const dynamic = 'force-dynamic';

export default async function AdminOrdenPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const [productos, categorias] = await Promise.all([
    prisma.producto.findMany({
      select: {
        id: true, nombre: true, categoria: true,
        precio: true, activo: true,
        imagenUrl: true, imagenesUrls: true, orden: true,
      },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    }),
    prisma.categoriaConfig.findMany({ orderBy: [{ orden: 'asc' }] }),
  ]);

  return (
    <>
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Orden del Catálogo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Arrastrá los productos para definir en qué orden se muestran en el catálogo público.
            Los cambios afectan a todos los clientes inmediatamente al guardar.
          </p>
        </div>

        <OrdenCatalogo initialProductos={productos as any} categorias={categorias} />
      </main>
    </>
  );
}
