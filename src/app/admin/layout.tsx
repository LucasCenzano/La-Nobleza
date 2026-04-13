import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin – Pollería La Nobleza',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {children}
    </div>
  );
}
