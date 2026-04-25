import { ETIQUETA_MAP, EtiquetaSlug } from '@/lib/constants';

interface Props {
  slug: string;
  size?: 'sm' | 'md';
  compact?: boolean;
}

export default function EtiquetaBadge({ slug, size = 'sm', compact }: Props) {
  const config = ETIQUETA_MAP[slug as EtiquetaSlug];
  if (!config) return null;

  const sizeClass = compact
    ? 'px-1.5 py-0 text-[9px]'
    : size === 'md'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold leading-none ${config.bg} ${config.text} ${sizeClass} transition-all`}
    >
      <span>{config.emoji}</span>
      {!compact && config.label}
    </span>
  );
}
