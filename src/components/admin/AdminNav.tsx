'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navLinks = [
  { href: '/admin',                 label: '📊 Dashboard',     exact: true  },
  { href: '/admin/productos',       label: '📋 Productos',     exact: false },
  { href: '/admin/productos/nuevo', label: '➕ Nuevo',         exact: true  },
  { href: '/admin/categorias',      label: '🏷️ Categorías',    exact: false },
  { href: '/admin/orden',           label: '↕️ Orden',         exact: false },
  { href: '/admin/configuracion',   label: '⚙️ Config',        exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between min-h-[56px] py-2 md:py-0 gap-2 md:gap-0">
        {/* Brand */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐔</span>
            <span className="font-display font-bold text-brand-700 text-sm sm:text-base">
              La Nobleza · Admin
            </span>
          </div>
          {/* Mobile Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="md:hidden px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-red-100"
          >
            Salir
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1.5 md:gap-1 overflow-x-auto scroll-x-hide pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {navLinks.map(({ href, label, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-[13px] sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block"></div>

          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-[13px] sm:text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
          >
            🌐 Catálogo
          </Link>

          {/* Desktop Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="hidden md:block ml-1 px-3 py-1.5 rounded-lg text-[13px] sm:text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
