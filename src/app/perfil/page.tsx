import type { Metadata } from 'next';
import InstagramProfile from '@/components/instagram/InstagramProfile';

export const metadata: Metadata = {
  title: 'La Nobleza Pollería – Perfil Instagram',
  description: 'Perfil de Instagram de Pollería La Nobleza, Los Ceibos 19, Salta, Argentina.',
};

export default function PerfilPage() {
  return <InstagramProfile />;
}
