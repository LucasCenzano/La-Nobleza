import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public endpoint — no auth required
// Returns banner + horarios for the public catalog
export async function GET() {
  try {
    const config = await prisma.configuracionTienda.findUnique({
      where: { id: 'singleton' },
    });
    if (!config) return NextResponse.json({ bannerActivo: false, horariosActivos: false });
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ bannerActivo: false, horariosActivos: false }, { status: 200 });
  }
}
