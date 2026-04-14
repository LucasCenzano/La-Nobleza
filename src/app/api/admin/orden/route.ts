import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/orden  →  body: [{ id, orden }]
// Bulk-updates the `orden` field for multiple products at once
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const items: { id: string; orden: number }[] = await req.json();

    await prisma.$transaction(
      items.map(({ id, orden }) =>
        prisma.producto.update({ where: { id }, data: { orden } }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/admin/orden]', err);
    return NextResponse.json({ message: 'Error al guardar el orden.' }, { status: 500 });
  }
}
