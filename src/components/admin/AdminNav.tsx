'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navLinks = [
  { href: '/admin/productos', label: '📋 Productos' },
  { href: '/admin/productos/nuevo', label: '➕ Nuevo Producto' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🐔</span>
          <span className="font-display font-bold text-brand-700 text-sm hidden sm:block">
            La Nobleza · Admin
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === href
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            🌐 Ver Catálogo
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
