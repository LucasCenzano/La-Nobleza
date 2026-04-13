'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/admin/productos');
    } else {
      setError('Credenciales incorrectas. Verificá tu email y contraseña.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-4">
            <span className="text-3xl">🐔</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Panel Administrativo</h1>
          <p className="text-brand-200 text-sm mt-1">Pollería La Nobleza</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="admin-email" className="label">Email</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@lanobleza.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="label">Contraseña</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span> Iniciando sesión...
                </>
              ) : (
                'Ingresar al Panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-300 text-xs mt-6">
          Acceso restringido a administradores
        </p>
      </div>
    </div>
  );
}
