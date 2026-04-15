import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const email = process.env.ADMIN_EMAIL ?? 'admin@lanobleza.com';
    const password = process.env.ADMIN_PASSWORD ?? 'adminlanobleza';
    
    const hashed = await hash(password, 12);

    await prisma.administrador.upsert({
      where: { email },
      update: { password: hashed },
      create: { 
        email, 
        password: hashed, 
        nombre: 'Administrador' 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Administrador creado o actualizado con éxito.',
      emailRegistrado: email
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
