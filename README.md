# 🍗 La Nobleza — Catálogo Digital Premium

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

**La Nobleza** es una plataforma de catálogo digital de alta gama diseñada específicamente para el sector minorista de alimentos (pollerías y almacenes). A diferencia de un catálogo estático, esta aplicación ofrece una experiencia de usuario fluida, optimizada para móviles y con un sistema de gestión de inventario en tiempo real.

---

## ✨ Características Principales

### 🛒 Experiencia del Cliente (Frontend)
- **Diseño Mobile-First Premium**: Interfaz moderna con estética cuidada, modo oscuro sutil y micro-animaciones de alto rendimiento.
- **Carrito Inteligente**: Sistema de pedidos que diferencia automáticamente productos por peso (Kg) y por unidad, permitiendo una estimación precisa del costo.
- **Integración con WhatsApp**: Generación dinámica de pedidos formateados para enviar directamente al local, facilitando la conversión.
- **Búsqueda y Filtros Dinámicos**: Buscador inteligente con placeholders descriptivos y filtrado por categorías mediante "chips" interactivos.
- **Visualización de Estados**: Indicadores claros de stock, ofertas, productos destacados y horario de atención del local.

### 🔐 Gestión Administrativa (Dashboard)
- **Control Total de Productos**: CRUD completo con soporte para múltiples imágenes, encuadres personalizados (framing) y etiquetas dinámicas.
- **Gestión de Stock Instantánea**: Toggles de disponibilidad en tiempo real que impactan inmediatamente en la visibilidad del catálogo.
- **Configuración de Negocio**: Panel para editar horarios, ubicación (Google Maps), contactos y mensajes personalizados de WhatsApp.
- **Importación Masiva**: Soporte para carga de datos vía Excel/CSV para gestionar catálogos de gran volumen (+200 productos).
- **Seguridad**: Autenticación robusta mediante NextAuth.js y protección de rutas administrativas.

---

## 🛠️ Stack Tecnológico

- **Core**: [Next.js 14](https://nextjs.org/) (App Router) con **TypeScript** para máxima robustez.
- **Estilos**: **Tailwind CSS** con variables personalizadas para un sistema de diseño consistente.
- **Base de Datos**: **PostgreSQL** alojado en [Neon](https://neon.tech/) (Serverless).
- **ORM**: [Prisma](https://www.prisma.io/) para modelado de datos y migraciones seguras.
- **Autenticación**: [NextAuth.js](https://next-auth.js.org/) para el manejo de sesiones administrativas.
- **Hosting & Analytics**: Desplegado en [Vercel](https://vercel.com/) con **Vercel Analytics** integrado.

---

## 🚀 Configuración y Desarrollo

### 1. Requisitos Previos
- Node.js 18+
- Una instancia de PostgreSQL (Recomendado: Neon.tech)

### 2. Instalación
```bash
git clone https://github.com/LucasCenzano/La-Nobleza.git
cd La-Nobleza
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
DATABASE_URL="postgres://..."
NEXTAUTH_SECRET="tu_secret_generado"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USER="admin@lanobleza.com"
ADMIN_PASSWORD="tu_password_segura"
```

### 4. Inicialización de Base de Datos
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts # Opcional: Carga datos de prueba
```

### 5. Ejecución
```bash
npm run dev
```

---

## 📂 Estructura del Proyecto

```text
src/
├── app/             # Rutas, API y Layouts (Next.js App Router)
├── components/      # Componentes UI (catalog/admin/ui)
├── hooks/           # Custom hooks (gestión de scroll, carritos, etc.)
├── lib/             # Utilidades, constantes y cliente Prisma
├── context/         # Context Providers (Carrito de compras)
└── middleware.ts    # Protección de rutas y optimización de cabeceras
```

---

## 📄 Licencia

Este proyecto es propiedad privada de **Pollería La Nobleza**. Todos los derechos reservados © 2024.

---
*Desarrollado con ❤️ para optimizar el comercio local.*
