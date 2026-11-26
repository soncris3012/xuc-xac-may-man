import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Gift,
  Trophy,
  CalendarCheck,
  Radio,
  BadgeDollarSign,
  LogIn,
  LogOut,
  Plus,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { DBService } from '../services/supabase';

export default function Header({
  profile,
  onProfileUpdate,
  onOpenAuth,
  onLogout,
  onOpenGiftCode,
  onOpenLeaderboard,
  canClaimDaily,
  totalPool = 0,
  roundCount = 0,
}) {
  const [muted, setMuted] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);
  const [dailyClaiming, setDailyClaiming] = useState(false);

  const isLoggedIn = Boolean(profile?.id);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
  };

  const toggleBgm = () => {
    const active = sounds.toggleCasinoBgm();
    setIsBgmOn(active);
  };

  const handleClaimDaily = async () => {
    if (!isLoggedIn) {
      onOpenAuth?.();
      return;
    }
    if (!canClaimDaily || dailyClaiming) return;
    setDailyClaiming(true);
    const res = await DBService.claimDailyBonus(profile.id);
    setDailyClaiming(false);

    if (res?.success && res?.user) {
      sounds.playWin();
      onProfileUpdate(res.user);
    } else {
      sounds.playClick();
      alert(res?.message || 'Bạn đã điểm danh hôm nay rồi!');
    }
  };

  return (
    <header className="w-full bg-[#120807]/95 border-b border-[#b8923a]/30 sticky top-0 z-40 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Royal Title & Phiên / Live */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🎲</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fce08b] via-[#e5be53] to-[#b58420]">
                  XÚC XẮC MAY MẮN
                </h1>
                <span className="text-[10px] font-bold text-stone-400 hidden sm:inline">
                  Phiên #{String(roundCount + 1).padStart(5, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Realtime
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-400 hidden md:inline">Game vui giải trí</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Glowing Royal Pool Pill (matches center gold pill in reference UI) */}
        <div className="hidden lg:flex items-center gap-2 royal-gold-pill px-5 py-1.5 rounded-full border border-[#fff2bd]/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-950/80">
            HŨ THƯỞNG
          </span>
          <span className="text-base font-black tracking-wider text-stone-950">
            ${Number(totalPool || 0).toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Right: Balance Pill + Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isLoggedIn && canClaimDaily && (
            <button
              type="button"
              onClick={handleClaimDaily}
              disabled={dailyClaiming}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow animate-pulse transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{dailyClaiming ? '...' : '+20K$'}</span>
            </button>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c0f0d] border border-[#b8923a]/50 shadow-inner">
                <BadgeDollarSign className="w-4 h-4 text-[#f5d061]" />
                <span className="text-xs sm:text-sm font-black text-[#f5d061]">
                  {Number(profile.balance || 0).toLocaleString('vi-VN')}
                </span>
                <button
                  type="button"
                  onClick={onOpenGiftCode}
                  title="Nhận thêm $ qua Giftcode"
                  className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center transition"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c0f0d] border border-white/10 text-[11px]">
                <span className="font-bold text-stone-200">{profile.username}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#b8923a]/20 text-[#f5d061] font-black text-[9px] border border-[#b8923a]/40">
                  VIP {profile.vip_level || 1}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất"
                className="p-2 rounded-full bg-[#1c0f0d] hover:bg-rose-950/70 text-stone-300 hover:text-rose-300 border border-white/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="royal-gold-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-stone-950 border border-[#fce08b]/50 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Giftcode */}
          <button
            type="button"
            onClick={onOpenGiftCode}
            title="Giftcode"
            className="p-2 rounded-full bg-[#1c0f0d] hover:bg-[#2b1714] text-[#f5d061] border border-[#b8923a]/30 transition"
          >
            <Gift className="w-3.5 h-3.5" />
          </button>

          {/* Leaderboard */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            title="Bảng Xếp Hạng"
            className="p-2 rounded-full bg-[#1c0f0d] hover:bg-[#2b1714] text-[#f5d061] border border-[#b8923a]/30 transition"
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>

          {/* BGM */}
          <button
            type="button"
            onClick={toggleBgm}
            title={isBgmOn ? 'Tắt nhạc Casino' : 'Bật nhạc Casino'}
            className={`p-2 rounded-full border transition ${
              isBgmOn
                ? 'bg-[#b8923a]/25 border-[#f5d061] text-[#f5d061]'
                : 'bg-[#1c0f0d] border-white/10 text-stone-400 hover:text-white'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isBgmOn ? 'animate-bounce' : ''}`} />
          </button>

          {/* SFX */}
          <button
            type="button"
            onClick={toggleSound}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-full bg-[#1c0f0d] hover:bg-[#2b1714] border border-white/10 text-stone-300 transition"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
