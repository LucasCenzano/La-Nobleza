import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';

// ── Optimized font loading via next/font (no render-blocking external requests) ──
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Almacén La Nobleza – Catálogo de Productos Frescos',
  description:
    'Encontrá pollos frescos, carnicería, pescado, huevos de campo y productos de almacén en Almacén La Nobleza. Calidad artesanal en Los Ceibos 19, Salta.',
  keywords: ['almacén', 'pollería', 'pollo', 'carnicería', 'La Nobleza', 'Salta', 'huevos de campo', 'catálogo online'],
  openGraph: {
    title: 'Almacén La Nobleza – Salta',
    description: 'Pollos frescos, carnicería y productos de almacén artesanal',
    type: 'website',
  },
};

import { CartProvider } from '@/components/catalog/CartContext';
import CartDrawer from '@/components/catalog/CartDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
