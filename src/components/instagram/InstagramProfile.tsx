'use client';

import Image from 'next/image';
import { useState } from 'react';

/* ─── SVG Icon Components ──────────────────────────────────────────── */

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconMoreHorizontal() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <line x1="17" y1="17" x2="22" y2="17" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconVerified() {
  return (
    <svg viewBox="0 0 24 24" fill="#3897f0" className="w-3.5 h-3.5 inline-block ml-0.5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3 h-3 ml-0.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3 h-3">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────── */

const POSTS = [
  { id: 1, src: '/instagram/post_store.png', isReel: false, hasMultiple: false },
  { id: 2, src: 'https://images.unsplash.com/photo-1612257999756-3e84f0d1d1ac?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 3, src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 4, src: '/instagram/post_tips.png', isReel: false, hasMultiple: false },
  { id: 5, src: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 6, src: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 7, src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', isReel: true, hasMultiple: false },
  { id: 8, src: 'https://images.unsplash.com/photo-1614852207131-5b7b4e6cfb12?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 9, src: 'https://images.unsplash.com/photo-1609501676490-c3929bc5af2f?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 10, src: 'https://images.unsplash.com/photo-1559181567-c3190ad9d7da?w=400&q=80', isReel: false, hasMultiple: false },
  { id: 11, src: '/instagram/post_tips.png', isReel: false, hasMultiple: false },
  { id: 12, src: 'https://images.unsplash.com/photo-1600326145552-327f74d17472?w=400&q=80', isReel: false, hasMultiple: false },
];

const HIGHLIGHTS = [
  { id: 1, label: 'HORARIOS', bg: 'from-amber-700 to-amber-900', emoji: '🕘' },
  { id: 2, label: 'UBICACIÓN', bg: 'from-amber-600 to-yellow-700', emoji: '📍' },
  { id: 3, label: 'PEDÍ YA', bg: 'from-green-700 to-green-900', emoji: '📲' },
  { id: 4, label: 'MÉTODOS...', bg: 'from-amber-800 to-yellow-900', emoji: '💳' },
];

const SUGGESTED = [
  { id: 1, name: 'Arquitecta en S...', handle: 'arq.ayiceleste', verified: true, src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id: 2, name: 'Constanza Moreno', handle: 'contimoreno', verified: false, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
  { id: 3, name: 'Chi...', handle: 'martii.b', verified: false, src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80' },
];

/* ─── Sub-components ────────────────────────────────────────────────── */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-white font-bold text-[15px] leading-tight">{value}</span>
      <span className="text-[#a8a8a8] text-[12px]">{label}</span>
    </div>
  );
}

function HighlightBubble({ label, bg, emoji }: { label: string; bg: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
      <div className={`w-[62px] h-[62px] rounded-full bg-gradient-to-br ${bg} flex items-center justify-center border-2 border-[#262626] shadow-lg group-hover:scale-105 transition-transform duration-200`}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <span className="text-[10px] text-white font-medium tracking-tight text-center max-w-[62px] leading-tight">
        {label}
      </span>
    </div>
  );
}

function SuggestedCard({ account, onDismiss }: { account: typeof SUGGESTED[0]; onDismiss: () => void }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="min-w-[148px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col items-center gap-2 relative flex-shrink-0">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[#a8a8a8] hover:text-white transition-colors"
        aria-label="Dismiss suggestion"
      >
        <IconX />
      </button>
      <div className="w-14 h-14 rounded-full overflow-hidden border border-[#333] relative">
        <Image src={account.src} alt={account.name} fill className="object-cover" unoptimized />
      </div>
      <div className="text-center">
        <p className="text-white text-[12px] font-semibold leading-tight">
          {account.name}
          {account.verified && <IconVerified />}
        </p>
        <p className="text-[#a8a8a8] text-[11px]">{account.handle}</p>
      </div>
      <button
        onClick={() => setFollowing(!following)}
        className={`w-full py-1.5 rounded-md text-[12px] font-semibold transition-all duration-200 ${
          following
            ? 'bg-[#2a2a2a] text-white border border-[#444]'
            : 'bg-[#0095f6] text-white hover:bg-[#1aa3ff]'
        }`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function PostThumbnail({ post }: { post: typeof POSTS[0] }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-[#1a1a1a] cursor-pointer group">
      <Image
        src={post.src}
        alt={`Post ${post.id}`}
        fill
        className="object-cover group-hover:brightness-75 transition-all duration-200"
        unoptimized
      />
      {post.isReel && (
        <div className="absolute top-1.5 right-1.5">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 drop-shadow">
            <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4-1v2h3V5H6zm5 0v2h2V5h-2zm4 0v2h3V5h-3zM2 9h20v9H2V9z" />
          </svg>
        </div>
      )}
      {post.hasMultiple && (
        <div className="absolute top-1.5 right-1.5">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 drop-shadow">
            <path d="M2 6C2 4.895 4.895 2 6 2h12c1.105 0 2 .895 2 2v12c0 1.105-.895 2-2 2H6c-1.105 0-2-.895-2-2V6zM2 9H0V20c0 2.21 1.79 4 4 4h11v-2H4c-1.105 0-2-.895-2-2V9z" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */

export default function InstagramProfile() {
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');
  const [suggested, setSuggested] = useState(SUGGESTED);
  const [isFollowing, setIsFollowing] = useState(true);

  function dismissSuggested(id: number) {
    setSuggested((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="min-h-screen bg-black flex justify-center">
      {/* Phone Frame */}
      <div className="w-full max-w-[430px] min-h-screen bg-black relative overflow-hidden">

        {/* ── Status Bar ── */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-white text-[13px] font-semibold">
          <span>19:09</span>
          <div className="flex items-center gap-1.5">
            {/* Signal bars */}
            <svg viewBox="0 0 24 16" className="w-5 h-3.5" fill="white">
              <rect x="0" y="10" width="3" height="6" rx="0.5" />
              <rect x="5" y="7" width="3" height="9" rx="0.5" />
              <rect x="10" y="4" width="3" height="12" rx="0.5" />
              <rect x="15" y="1" width="3" height="15" rx="0.5" />
            </svg>
            {/* WiFi */}
            <svg viewBox="0 0 24 18" className="w-4 h-3.5" fill="white">
              <path d="M12 14a2 2 0 100 4 2 2 0 000-4zM4.93 9.07a10 10 0 0114.14 0l1.41-1.41a12 12 0 00-16.97 0l1.42 1.41zM7.76 11.9a6 6 0 018.49 0l1.41-1.41a8 8 0 00-11.31 0l1.41 1.41z" />
            </svg>
            {/* Battery */}
            <div className="flex items-center">
              <div className="w-[22px] h-[11px] border border-white rounded-sm relative flex items-center px-0.5">
                <div className="h-[7px] w-[14px] bg-white rounded-[1px]" />
              </div>
              <div className="w-[2px] h-[5px] bg-white rounded-r-sm ml-0.5 opacity-60" />
            </div>
          </div>
        </div>

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between px-4 py-2">
          <button className="text-white p-1 hover:bg-white/10 rounded-full transition-colors">
            <IconBack />
          </button>
          <span className="text-white font-bold text-[16px] tracking-tight">pollerialanobleza</span>
          <div className="flex items-center gap-3 text-white">
            <button className="hover:bg-white/10 rounded-full p-1 transition-colors">
              <IconBell />
            </button>
            <button className="hover:bg-white/10 rounded-full p-1 transition-colors">
              <IconMoreHorizontal />
            </button>
          </div>
        </div>

        {/* ── Profile Header ── */}
        <div className="px-4 pt-2 pb-3">
          {/* Avatar + Stats */}
          <div className="flex items-center gap-5 mb-3">
            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div className="w-[90px] h-[90px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-[#111]">
                  <Image
                    src="/instagram/avatar.png"
                    alt="La Nobleza Pollería avatar"
                    width={86}
                    height={86}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around">
              <StatItem value="44" label="posts" />
              <StatItem value="2.984" label="followers" />
              <StatItem value="523" label="friends" />
            </div>
          </div>

          {/* Name */}
          <p className="text-white font-bold text-[14px] leading-snug">La Nobleza Polleria</p>

          {/* Category */}
          <p className="text-[#a8a8a8] text-[12px] mb-1.5">Product/service</p>

          {/* Bio */}
          <div className="text-white text-[13px] leading-snug space-y-0.5">
            <p>🍗 Pollos frescos</p>
            <p>🥚 Huevos de campo</p>
            <p>❄️ Pescado, Pastas, Pizza, Empanadas</p>
            <p>
              🕘 Lun a Vie 9-14 ;18-22 Sab 9-14
              <button className="text-[#a8a8a8] ml-1 font-medium text-[12px]">more</button>
            </p>
          </div>

          {/* Location */}
          <p className="text-[#4dabf7] text-[13px] mt-1">Los Ceibos 19, Salta, Argentina</p>

          {/* See Translation */}
          <button className="text-white text-[13px] font-semibold mt-0.5 hover:text-[#a8a8a8] transition-colors">
            See Translation
          </button>

          {/* Link */}
          <div className="flex items-center gap-1 mt-1">
            <IconLink />
            <a
              href="https://linktr.ee/pollerialanobleza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4dabf7] text-[13px] hover:underline"
            >
              linktr.ee/pollerialanobleza
            </a>
          </div>

          {/* Chip */}
          <div className="mt-2">
            <div className="inline-flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333] rounded-full px-3 py-1">
              <div className="w-4 h-4 rounded-full bg-[#333] flex items-center justify-center">
                <span className="text-[9px]">📍</span>
              </div>
              <span className="text-white text-[12px] font-medium">Pollería La Nobleza</span>
            </div>
          </div>

          {/* Followed by */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1494790108755-2616b612b98c?w=60&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80',
              ].map((src, i) => (
                <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-black relative">
                  <Image src={src} alt="follower" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
            <p className="text-white text-[12px] leading-tight">
              Followed by <span className="font-semibold">valebusstos</span>,{' '}
              <span className="font-semibold">luucas_oliiver</span> and{' '}
              <span className="font-semibold">95 others</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 flex items-center justify-center gap-1 py-[7px] rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                isFollowing
                  ? 'bg-[#262626] text-white hover:bg-[#333]'
                  : 'bg-[#0095f6] text-white hover:bg-[#1aa3ff]'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
              {isFollowing && <IconChevronDown />}
            </button>
            <button className="flex-1 bg-[#262626] text-white py-[7px] rounded-lg text-[13px] font-semibold hover:bg-[#333] transition-colors">
              Message
            </button>
            <button className="flex-1 bg-[#262626] text-white py-[7px] rounded-lg text-[13px] font-semibold hover:bg-[#333] transition-colors">
              Contact
            </button>
            <button className="bg-[#262626] text-white p-[7px] rounded-lg hover:bg-[#333] transition-colors">
              <IconUserPlus />
            </button>
          </div>
        </div>

        {/* ── Story Highlights ── */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-4 px-4 pb-4 pt-1" style={{ width: 'max-content' }}>
            {HIGHLIGHTS.map((h) => (
              <HighlightBubble key={h.id} label={h.label} bg={h.bg} emoji={h.emoji} />
            ))}
          </div>
        </div>

        {/* ── Suggested for you ── */}
        {suggested.length > 0 && (
          <div className="border-t border-[#1a1a1a] pt-3 pb-2">
            <div className="flex items-center justify-between px-4 mb-2.5">
              <h3 className="text-white font-bold text-[14px]">Suggested for you</h3>
              <button className="text-white font-semibold text-[12px] hover:text-[#a8a8a8] transition-colors">
                See all
              </button>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: 'none' }}>
              {suggested.map((acc) => (
                <SuggestedCard
                  key={acc.id}
                  account={acc}
                  onDismiss={() => dismissSuggested(acc.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="border-t border-[#1a1a1a] flex">
          {[
            { key: 'grid',   Icon: IconGrid,  label: 'Posts' },
            { key: 'reels',  Icon: IconPlay,  label: 'Reels' },
            { key: 'tagged', Icon: IconUser,  label: 'Tagged' },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 flex justify-center items-center py-3 border-t-[1.5px] transition-colors duration-150 ${
                activeTab === key
                  ? 'border-white text-white'
                  : 'border-transparent text-[#737373]'
              }`}
              aria-label={label}
            >
              <Icon />
            </button>
          ))}
        </div>

        {/* ── Photo Grid ── */}
        <div className="grid grid-cols-3 gap-[2px]">
          {POSTS.map((post) => (
            <PostThumbnail key={post.id} post={post} />
          ))}
        </div>

        {/* ── Bottom Nav Bar ── */}
        <div className="sticky bottom-0 bg-black border-t border-[#1a1a1a] flex items-center justify-around px-6 py-3 mt-2">
          <button className="text-white" aria-label="Feed">
            <IconGrid />
          </button>
          <button className="text-[#737373] hover:text-white transition-colors" aria-label="Reels">
            <IconPlay />
          </button>
          <button className="text-[#737373] hover:text-white transition-colors" aria-label="Profile">
            <IconUser />
          </button>
        </div>

      </div>
    </div>
  );
}
