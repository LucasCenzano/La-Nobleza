import { ETIQUETA_MAP, EtiquetaSlug } from '@/lib/constants';

interface Props {
  slug: string;
  size?: 'sm' | 'md';
}

export default function EtiquetaBadge({ slug, size = 'sm' }: Props) {
  const config = ETIQUETA_MAP[slug as EtiquetaSlug];
  if (!config) return null;

  const sizeClass = size === 'md'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold leading-none ${config.bg} ${config.text} ${sizeClass}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
