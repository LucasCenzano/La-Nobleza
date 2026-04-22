import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Crear una instancia de Ratelimit.
// Permite 10 peticiones cada 10 segundos por IP.
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  ephemeralCache: new Map(),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Extraer la IP del cliente
  const ip = request.ip ?? '127.0.0.1';
  
  // En desarrollo o si KV no está configurado, saltamos el rate limit
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return NextResponse.next();
  }

  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
    
    // Si la petición excedió el límite
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Por favor, intenta más tarde.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
    
    // Si la petición es permitida, añadimos los headers informativos
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', limit.toString());
    res.headers.set('X-RateLimit-Remaining', remaining.toString());
    res.headers.set('X-RateLimit-Reset', reset.toString());
    return res;
  } catch (error) {
    console.error('Error de Rate Limit:', error);
    // En caso de error de KV, permitimos que pase la request para no romper la app
    return NextResponse.next();
  }
}

// Configurar en qué rutas se ejecutará este middleware
export const config = {
  matcher: '/api/public/:path*',
};
