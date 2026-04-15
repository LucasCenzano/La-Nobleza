import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
