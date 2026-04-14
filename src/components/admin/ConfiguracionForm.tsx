'use client';

import { useEffect, useState } from 'react';

interface HorarioDia {
  activo: boolean;
  abre:   string;
  cierra: string;
}

const DIAS: { key: string; label: string }[] = [
  { key: 'lunes',     label: 'Lunes'     },
  { key: 'martes',    label: 'Martes'    },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves'    },
  { key: 'viernes',   label: 'Viernes'   },
  { key: 'sabado',    label: 'Sábado'    },
  { key: 'domingo',   label: 'Domingo'   },
];

const DEFAULT_HORARIOS: Record<string, HorarioDia> = Object.fromEntries(
  DIAS.map(({ key }) => [
    key,
    { activo: key !== 'domingo', abre: '08:00', cierra: key === 'sabado' ? '13:00' : '19:00' },
  ]),
);

const BANNER_TIPOS = [
  { value: 'INFO',    label: '💬 Información',  bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  { value: 'PROMO',   label: '🔥 Promoción',    bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  { value: 'ALERTA',  label: '⚠️ Alerta',       bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200' },
  { value: 'CERRADO', label: '🔒 Cerrado',      bg: 'bg-gray-100',  text: 'text-gray-700',   border: 'border-gray-200' },
];

interface Config {
  bannerActivo:    boolean;
  bannerTipo:      string;
  bannerTexto:     string;
  bannerColor:     string;
  horariosActivos: boolean;
  horarios:        Record<string, HorarioDia> | null;
}

const DEFAULT_CONFIG: Config = {
  bannerActivo:    false,
  bannerTipo:      'INFO',
  bannerTexto:     '',
  bannerColor:     '#f97316',
  horariosActivos: true,
  horarios:        DEFAULT_HORARIOS,
};

export default function ConfiguracionForm() {
  const [config,  setConfig]  = useState<Config>(DEFAULT_CONFIG);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/configuracion')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          horarios: data.horarios ?? DEFAULT_HORARIOS,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function updateBanner(partial: Partial<Config>) {
    setConfig((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  function updateHorario(dia: string, partial: Partial<HorarioDia>) {
    setConfig((prev) => ({
      ...prev,
      horarios: {
        ...(prev.horarios ?? DEFAULT_HORARIOS),
        [dia]: { ...(prev.horarios?.[dia] ?? DEFAULT_HORARIOS[dia]), ...partial },
      },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/configuracion', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(config),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  const activeBannerTipo = BANNER_TIPOS.find((t) => t.value === config.bannerTipo) ?? BANNER_TIPOS[0];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ── Save button bar ──────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-600">
          {saved ? '✅ Configuración guardada' : 'Realizá los cambios y guardá al terminar'}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          {saving ? '⟳ Guardando...' : '💾 Guardar configuración'}
        </button>
      </div>

      {/* ── Banner del catálogo ──────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">📢 Banner / Anuncio del día</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Aparece en la parte superior del catálogo público
            </p>
          </div>
          {/* Active toggle */}
          <label className="toggle" title={config.bannerActivo ? 'Desactivar banner' : 'Activar banner'}>
            <input
              type="checkbox"
              checked={config.bannerActivo}
              onChange={(e) => updateBanner({ bannerActivo: e.target.checked })}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>

        <div className={`transition-all ${!config.bannerActivo ? 'opacity-40 pointer-events-none' : ''}`}>
          {/* Tipo de banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {BANNER_TIPOS.map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => updateBanner({ bannerTipo: tipo.value })}
                className={`p-3 rounded-xl border-2 text-xs font-semibold text-center transition-all ${
                  config.bannerTipo === tipo.value
                    ? `${tipo.bg} ${tipo.text} ${tipo.border} ring-2 ring-offset-1 ring-brand-400`
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>

          {/* Texto del banner */}
          <div className="mb-4">
            <label className="label">Texto del banner</label>
            <textarea
              rows={2}
              value={config.bannerTexto}
              onChange={(e) => updateBanner({ bannerTexto: e.target.value })}
              className="input resize-none"
              placeholder="Ej: 🔥 ¡Promo del día! 20% off en pollos enteros. Solo hoy."
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {config.bannerTexto.length}/200 caracteres
            </p>
          </div>

          {/* Preview */}
          {config.bannerTexto && (
            <div className={`border rounded-xl p-4 text-sm font-medium ${activeBannerTipo.bg} ${activeBannerTipo.text} ${activeBannerTipo.border}`}>
              <p className="font-semibold text-[10px] uppercase tracking-wider opacity-60 mb-1">
                Vista previa del banner:
              </p>
              {config.bannerTexto}
            </div>
          )}
        </div>
      </section>

      {/* ── Horarios ─────────────────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">🕐 Horarios de atención</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Se muestran en el catálogo para que los clientes sepan cuándo pueden comprar
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={config.horariosActivos}
              onChange={(e) => updateBanner({ horariosActivos: e.target.checked })}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>

        <div className={`space-y-2 transition-all ${!config.horariosActivos ? 'opacity-40 pointer-events-none' : ''}`}>
          {DIAS.map(({ key, label }) => {
            const h = config.horarios?.[key] ?? DEFAULT_HORARIOS[key];
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  h.activo ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                {/* Día toggle */}
                <label className="toggle flex-shrink-0" title={h.activo ? 'Cerrado este día' : 'Abierto este día'}>
                  <input
                    type="checkbox"
                    checked={h.activo}
                    onChange={(e) => updateHorario(key, { activo: e.target.checked })}
                  />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>

                {/* Nombre del día */}
                <span className={`w-24 text-sm font-semibold flex-shrink-0 ${h.activo ? 'text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </span>

                {h.activo ? (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={h.abre}
                        onChange={(e) => updateHorario(key, { abre: e.target.value })}
                        className="input text-sm py-1.5 flex-1"
                        aria-label={`${label} apertura`}
                      />
                      <span className="text-gray-400 text-sm flex-shrink-0">a</span>
                      <input
                        type="time"
                        value={h.cierra}
                        onChange={(e) => updateHorario(key, { cierra: e.target.value })}
                        className="input text-sm py-1.5 flex-1"
                        aria-label={`${label} cierre`}
                      />
                    </div>
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">Abierto</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic flex-1">Cerrado</span>
                )}
              </div>
            );
          })}

          {/* Horarios preview */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Vista previa en el catálogo:
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {DIAS.filter(({ key }) => config.horarios?.[key]?.activo).map(({ key, label }) => {
                const h = config.horarios?.[key]!;
                return (
                  <span key={key} className="text-xs text-gray-600">
                    <strong>{label.substring(0, 3)}:</strong> {h.abre}–{h.cierra}
                  </span>
                );
              })}
              {DIAS.filter(({ key }) => !config.horarios?.[key]?.activo).length > 0 && (
                <span className="text-xs text-gray-400">
                  Cerrado: {DIAS.filter(({ key }) => !config.horarios?.[key]?.activo).map((d) => d.label).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
