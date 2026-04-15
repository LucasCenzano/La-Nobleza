import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const i = parseInt(req.nextUrl.searchParams.get('idx') || '0', 10);

    const p = await prisma.producto.findUnique({
      where: { id },
      select: { imagenesUrls: true, imagenUrl: true }
    });

    if (!p) return new NextResponse('Not found', { status: 404 });

    const allImages = (p.imagenesUrls && p.imagenesUrls.length > 0) 
      ? p.imagenesUrls 
      : (p.imagenUrl ? [p.imagenUrl] : []);
      
    const base64Str = allImages[i];
    if (!base64Str) return new NextResponse('Not found', { status: 404 });

    if (base64Str.startsWith('http')) {
      return NextResponse.redirect(base64Str);
    }

    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse('Invalid image format', { status: 500 });
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (e) {
    console.error('Error fetching image:', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}
