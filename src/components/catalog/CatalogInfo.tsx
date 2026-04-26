interface HorarioDia {
  activo: boolean;
  abre:   string;
  cierra: string;
  dobleTurno?: boolean;
  abre2?: string;
  cierra2?: string;
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
    <div
      className={`border-b ${style.bg} ${style.border}`}
      style={{ borderColor: 'rgba(210,175,120,0.25)' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium">
        <span className="text-base">{style.icon}</span>
        <span className={style.text}>{config.bannerTexto}</span>
      </div>
    </div>
  );
}

export function CatalogHorarios({ config }: { config: BannerData | null }) {
  if (!config?.horariosActivos || !config.horarios) return null;

  const today = new Date().getDay();
  const dayKeyMap: Record<number, string> = {
    1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'domingo',
  };
  const todayKey     = dayKeyMap[today];
  const todayHorario = config.horarios[todayKey];
  const isOpenToday  = todayHorario?.activo;

  // ── Agrupar días consecutivos con el mismo horario ──
  const ORDERED_KEYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  function scheduleKey(h: HorarioDia): string {
    if (!h.activo) return '__CLOSED__';
    return `${h.abre}-${h.cierra}${h.dobleTurno ? `|${h.abre2 || '18:00'}-${h.cierra2 || '22:00'}` : ''}`;
  }

  function formatSchedule(h: HorarioDia): string {
    return `${h.abre}–${h.cierra}${h.dobleTurno ? ` y ${h.abre2 || '18:00'}–${h.cierra2 || '22:00'}` : ''}`;
  }

  // Build groups of consecutive days with same schedule
  const groups: { days: string[]; schedule: string; closed: boolean }[] = [];
  for (const key of ORDERED_KEYS) {
    const h = config.horarios[key];
    if (!h) continue;
    const sKey = scheduleKey(h);
    const last = groups[groups.length - 1];
    if (last && scheduleKey(config.horarios[last.days[last.days.length - 1]] as HorarioDia) === sKey) {
      last.days.push(key);
    } else {
      groups.push({ days: [key], schedule: h.activo ? formatSchedule(h) : '', closed: !h.activo });
    }
  }

  // Filter out closed groups (we only show open ones)
  const openGroups = groups.filter(g => !g.closed);

  function groupLabel(days: string[]): string {
    if (days.length === 1) return DIAS_LABEL[days[0]] ?? days[0];
    return `${DIAS_LABEL[days[0]]} a ${DIAS_LABEL[days[days.length - 1]]}`;
  }

  return (
    <>
      {/* Banner amigable para Desktop cuando está cerrado */}
      {!isOpenToday && (
        <div className="hidden md:block bg-[var(--black-charcoal)] text-white py-2 text-center text-[13px] font-medium tracking-wide animate-fade-in">
          ✨ Estamos descansando, pero podés armar tu pedido para mañana.
        </div>
      )}

      <div
        className="border-b"
        style={{ background: 'linear-gradient(90deg,#fdf9f3,#f9f0e3)', borderColor: 'rgba(210,175,120,0.25)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <span
            className="font-semibold flex items-center gap-1"
            style={{ color: isOpenToday ? '#15803d' : '#92400e' }}
          >
            <span>{isOpenToday ? '🟢' : '😴'}</span>
            {isOpenToday
              ? `Hoy abierto: ${todayHorario.abre}–${todayHorario.cierra}${todayHorario.dobleTurno ? ` y ${todayHorario.abre2 || '18:00'}–${todayHorario.cierra2 || '22:00'}` : ''}`
              : 'Hoy descansamos (podés armar tu pedido p/ mañana)'}
          </span>

        {openGroups.map((g, i) => (
          <span key={i} style={{ color: 'rgba(90,60,30,0.6)' }}>
            <strong style={{ color: 'rgba(90,60,30,0.85)' }}>{groupLabel(g.days)}:</strong>{' '}
            {g.schedule}
          </span>
        ))}
      </div>
    </div>
    </>
  );
}
