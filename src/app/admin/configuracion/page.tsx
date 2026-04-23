import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import ConfiguracionForm from '@/components/admin/ConfiguracionForm';

export const dynamic = 'force-dynamic';

export default async function AdminConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  return (
    <>
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Configuración de la Tienda
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administrá el banner del catálogo, los horarios de atención y el mensaje de WhatsApp que se envía con cada pedido.
          </p>
        </div>
        <ConfiguracionForm />
      </main>
    </>
  );
}
