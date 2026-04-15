import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';



export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ message: 'No se recibió archivo.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to base64 Data URL to store directly in the database (Neon)
    const mime = file.type || 'image/webp';
    const base64 = buffer.toString('base64');
    const url = `data:${mime};base64,${base64}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[POST /api/admin/upload]', err);
    return NextResponse.json({ message: 'Error al subir la imagen.' }, { status: 500 });
  }
}
