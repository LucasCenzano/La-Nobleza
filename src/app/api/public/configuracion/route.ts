import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

// Public endpoint — no auth required
// Returns banner + horarios for the public catalog
export async function GET() {
  try {
    const config = await prisma.configuracionTienda.findUnique({
      where: { id: 'singleton' },
    });
    if (!config) return NextResponse.json({ bannerActivo: false, horariosActivos: false });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ bannerActivo: false, horariosActivos: false }, { status: 200 });
  }
}
