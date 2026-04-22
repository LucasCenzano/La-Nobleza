import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

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

    // ── Seed Categories ──
    const MOCK_CATEGORIAS = [
      { id: '1',  slug: 'POLLERIA',              nombre: 'Pollería',                          emoji: '🍗', color: '#000', orden: 0,  activo: true },
      { id: '2',  slug: 'PESCADERIA',            nombre: 'Pescadería',                        emoji: '🐟', color: '#000', orden: 1,  activo: true },
      { id: '3',  slug: 'PASTAS',                nombre: 'Pastas',                            emoji: '🍝', color: '#000', orden: 2,  activo: true },
      { id: '4',  slug: 'COMIDAS_PREPARADAS',    nombre: 'Comidas Preparadas',                emoji: '🍲', color: '#000', orden: 3,  activo: true },
      { id: '5',  slug: 'CONGELADOS',            nombre: 'Congelados',                        emoji: '🧊', color: '#000', orden: 4,  activo: true },
      { id: '6',  slug: 'ALMACEN',               nombre: 'Almacén',                           emoji: '🫙', color: '#000', orden: 5,  activo: true },
      { id: '7',  slug: 'IMPORTADOS_ESPECIALES', nombre: 'Productos Importados / Especiales', emoji: '🌎', color: '#000', orden: 6,  activo: true },
      { id: '8',  slug: 'ESPECIAS',              nombre: 'Especias',                          emoji: '🌶️', color: '#000', orden: 7,  activo: true },
    ];

    const count = await prisma.categoriaConfig.count();
    let categoriasCreadas = 0;
    if (count === 0) {
      for (const cat of MOCK_CATEGORIAS) {
        await prisma.categoriaConfig.create({
          data: {
            slug: cat.slug,
            nombre: cat.nombre,
            emoji: cat.emoji,
            color: cat.color,
            orden: cat.orden,
            activo: cat.activo
          }
        });
        categoriasCreadas++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Administrador creado o actualizado con éxito. ' + (categoriasCreadas > 0 ? `Se cargaron ${categoriasCreadas} categorías base.` : 'Las categorías ya estaban cargadas.'),
      emailRegistrado: email
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
