import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/configuracion
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const config = await prisma.configuracionTienda.upsert({
    where:  { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  return NextResponse.json(config);
}

// PUT /api/admin/configuracion
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const config = await prisma.configuracionTienda.upsert({
      where:  { id: 'singleton' },
      update: { ...body, id: undefined },
      create: { id: 'singleton', ...body },
    });
    return NextResponse.json(config);
  } catch (err) {
    console.error('[PUT /api/admin/configuracion]', err);
    return NextResponse.json({ message: 'Error al guardar.' }, { status: 500 });
  }
}
