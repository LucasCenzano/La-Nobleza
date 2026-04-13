# 🍗 Pollería La Nobleza — Catálogo Digital MVP

> Plataforma web autogestionable para mostrar el catálogo actualizado de productos de una pollería, con un panel de administración privado.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| ORM | Prisma |
| Base de datos | PostgreSQL (Neon) |
| Autenticación | NextAuth.js (Credentials) |
| Hosting | Vercel |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                         # Catálogo público (home)
│   ├── layout.tsx                       # Root layout + SEO
│   ├── globals.css                      # Estilos globales
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   └── admin/productos/
│   │       ├── route.ts                 # GET, POST
│   │       └── [id]/route.ts            # GET, PUT, PATCH, DELETE
│   └── admin/
│       ├── layout.tsx                   # Admin layout (no-index)
│       ├── login/page.tsx               # Login page
│       └── productos/
│           ├── page.tsx                 # Lista de productos (CRUD)
│           ├── nuevo/page.tsx           # Crear producto
│           └── [id]/editar/page.tsx     # Editar producto
├── components/
│   ├── catalog/
│   │   ├── CatalogHeader.tsx
│   │   ├── ProductCard.tsx             # Tarjeta con lazy load + badges
│   │   └── SearchFilters.tsx           # Búsqueda + filtro por categoría
│   └── admin/
│       ├── AdminNav.tsx
│       ├── ProductTable.tsx            # Tabla con toggle de stock
│       └── ProductForm.tsx             # Formulario crear/editar
└── lib/
    ├── prisma.ts                        # Singleton Prisma Client
    ├── auth.ts                          # NextAuth options
    └── constants.ts                     # Labels + formatPrecio()
prisma/
├── schema.prisma
└── seed.ts
```

---

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editá .env.local con tus credenciales de Neon y NextAuth secret
```

Generá el secret con:
```bash
openssl rand -base64 32
```

### 3. Crear la base de datos

```bash
npm run db:generate   # Genera el Prisma client
npm run db:push       # Aplica el schema a Neon
```

### 4. Seed (opcional)

```bash
npx tsx prisma/seed.ts
```

Esto crea el admin inicial (`admin@lanobleza.com`) y 5 productos de ejemplo.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

---

## Funcionalidades MVP

### Catálogo Público (`/`)
- ✅ Grilla responsive (mobile-first, 2→3→4 columnas)
- ✅ Lazy loading de imágenes
- ✅ Diferenciación visual: precio x **Unidad** vs precio x **Kg**
- ✅ Búsqueda por nombre (URL params, sin reload)
- ✅ Filtro por categoría (pills)
- ✅ Solo muestra productos con `activo: true`

### Panel Admin (`/admin`)
- ✅ Login con email + contraseña (NextAuth Credentials)
- ✅ CRUD completo de productos
- ✅ Toggle instantáneo Activo/Sin Stock (PATCH sin reload de página)
- ✅ Vista previa de imagen al cargar URL
- ✅ Stats (total / activos / pausados)

### Fuera de alcance (MVP)
- ❌ Carrito de compras
- ❌ Pasarela de pago
- ❌ Registro de clientes

---

## Despliegue en Vercel

1. Push del repositorio a GitHub
2. Conectar en [Vercel](https://vercel.com)
3. Configurar las variables de entorno en el dashboard de Vercel
4. Deploy automático en cada push a `main`

---

## Licencia

Proyecto privado — Pollería La Nobleza © 2025
