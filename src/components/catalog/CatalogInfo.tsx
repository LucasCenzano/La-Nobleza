interface HorarioDia {
  activo: boolean;
  abre:   string;
  cierra: string;
}

interface BannerData {
  bannerActivo:    boolean;
  bannerTipo:      string;
  bannerTexto:     string;
  bannerColor:     string;
  horariosActivos: boolean;
  horarios:        Record<string, HorarioDia> | null;
}

const TIPO_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  INFO:    { bg: 'bg-blue-50',   text: 'text-blue-900',   border: 'border-blue-200', icon: 'ℹ️' },
  PROMO:   { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', icon: '🔥' },
  ALERTA:  { bg: 'bg-red-50',   text: 'text-red-900',    border: 'border-red-200',   icon: '⚠️' },
  CERRADO: { bg: 'bg-gray-100',  text: 'text-gray-700',   border: 'border-gray-300',  icon: '🔒' },
};

const DIAS_LABEL: Record<string, string> = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
};

export async function getCatalogConfig(): Promise<BannerData | null> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const config = await prisma.configuracionTienda.findUnique({ where: { id: 'singleton' } });
    return config as unknown as BannerData;
  } catch {
    return null;
  }
}

export function CatalogBanner({ config }: { config: BannerData | null }) {
  if (!config?.bannerActivo || !config.bannerTexto) return null;

  const style = TIPO_STYLES[config.bannerTipo] ?? TIPO_STYLES.INFO;

  return (
    <div className={`border-b ${style.bg} ${style.border}`}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium">
        <span className="text-base">{style.icon}</span>
        <span className={style.text}>{config.bannerTexto}</span>
      </div>
    </div>
  );
}

export function CatalogHorarios({ config }: { config: BannerData | null }) {
  if (!config?.horariosActivos || !config.horarios) return null;

  const dias = Object.entries(config.horarios);
  const abiertos  = dias.filter(([, h]) => h.activo);
  const cerrados  = dias.filter(([, h]) => !h.activo);

  // Group consecutive same-hours days
  const today = new Date().getDay(); // 0=domingo, 1=lunes...
  const dayKeyMap: Record<number, string> = {
    1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'domingo',
  };
  const todayKey = dayKeyMap[today];
  const todayHorario = config.horarios[todayKey];
  const isOpenToday = todayHorario?.activo;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
        {/* Today highlight */}
        <span className={`font-semibold ${isOpenToday ? 'text-green-600' : 'text-red-500'}`}>
          {isOpenToday
            ? `🟢 Hoy abierto: ${todayHorario.abre}–${todayHorario.cierra}`
            : '🔴 Hoy cerrado'}
        </span>

        {/* All open days summary */}
        {abiertos.map(([key, h]) => (
          <span key={key}>
            <strong>{DIAS_LABEL[key] ?? key}:</strong> {h.abre}–{h.cierra}
          </span>
        ))}

        {cerrados.length > 0 && (
          <span className="text-gray-400">
            Cerrado: {cerrados.map(([k]) => DIAS_LABEL[k] ?? k).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
