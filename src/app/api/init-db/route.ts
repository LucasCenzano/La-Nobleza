import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

// ── SEGURIDAD: Esta ruta solo puede ejecutarse con un token secreto.
// Configurar INIT_DB_SECRET en Vercel con un valor aleatorio seguro.
// Una vez inicializada la BD en producción, eliminar INIT_DB_SECRET
// del entorno para desactivar permanentemente esta ruta.
// Uso: GET /api/init-db?secret=TU_SECRET_AQUI
export async function GET(req: NextRequest) {
  const secret = process.env.INIT_DB_SECRET;

  // Si INIT_DB_SECRET no está configurado en el entorno, la ruta está desactivada.
  if (!secret) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const tokenParam = req.nextUrl.searchParams.get('secret');

  // Comparación de strings: si no coincide, devolvemos 404 (no 401/403)
  // para no revelar que esta ruta existe ni qué espera.
  if (!tokenParam || tokenParam !== secret) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

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
      { slug: 'POLLERIA',              nombre: 'Pollería',                          emoji: '🍗', color: '#000', orden: 0,  activo: true },
      { slug: 'PESCADERIA',            nombre: 'Pescadería',                        emoji: '🐟', color: '#000', orden: 1,  activo: true },
      { slug: 'PASTAS',                nombre: 'Pastas',                            emoji: '🍝', color: '#000', orden: 2,  activo: true },
      { slug: 'COMIDAS_PREPARADAS',    nombre: 'Comidas Preparadas',                emoji: '🍲', color: '#000', orden: 3,  activo: true },
      { slug: 'CONGELADOS',            nombre: 'Congelados',                        emoji: '🧊', color: '#000', orden: 4,  activo: true },
      { slug: 'ALMACEN',               nombre: 'Almacén',                           emoji: '🫙', color: '#000', orden: 5,  activo: true },
      { slug: 'IMPORTADOS_ESPECIALES', nombre: 'Productos Importados / Especiales', emoji: '🌎', color: '#000', orden: 6,  activo: true },
      { slug: 'ESPECIAS',              nombre: 'Especias',                          emoji: '🌶️', color: '#000', orden: 7,  activo: true },
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

