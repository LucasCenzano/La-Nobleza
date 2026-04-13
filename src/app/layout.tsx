import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pollería La Nobleza – Catálogo de Productos',
  description:
    'Encontrá los mejores pollos, presas y productos cárnicos de Pollería La Nobleza. Calidad y frescura garantizadas.',
  keywords: ['pollería', 'pollo', 'carnes', 'La Nobleza', 'catálogo online'],
  openGraph: {
    title: 'Pollería La Nobleza',
    description: 'Catálogo digital de productos frescos',
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
