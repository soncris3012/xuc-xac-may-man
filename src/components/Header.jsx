import React, { useState } from 'react';
import {
  Coins,
  Volume2,
  VolumeX,
  Music,
  Gift,
  Trophy,
  CalendarCheck,
  Database,
  Cloud,
  BadgeDollarSign,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../services/audio';
import { isSupabaseConfigured, DBService } from '../services/supabase';

export default function Header({
  profile,
  onProfileUpdate,
  onOpenGiftCode,
  onOpenLeaderboard,
  canClaimDaily,
  setCanClaimDaily,
}) {
  const [muted, setMuted] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);
  const [dailyClaiming, setDailyClaiming] = useState(false);

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
    if (!canClaimDaily || dailyClaiming) return;
    setDailyClaiming(true);
    const updated = await DBService.claimDailyBonus(profile);
    sounds.playWin();
    onProfileUpdate(updated);
    setCanClaimDaily(false);
    setDailyClaiming(false);
  };

  return (
    <header className="w-full bg-slate-950/90 border-b-2 border-amber-500/40 sticky top-0 z-40 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Casino Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl drop-shadow">🎲</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow flex items-center gap-1.5">
                <span>XÚC XẮC MAY MẮN</span>
                <Sparkles className="w-4 h-4 text-amber-400 inline" />
              </h1>
              {/* Storage Mode Badge */}
              <span
                title={
                  isSupabaseConfigured
                    ? 'Đã kết nối cơ sở dữ liệu Supabase Cloud'
                    : 'Đang chạy chế độ LocalStorage'
                }
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isSupabaseConfigured ? <Cloud className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                <span className="hidden sm:inline">{isSupabaseConfigured ? 'Supabase' : 'Offline'}</span>
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 font-medium tracking-wide">
              Casino Club • Game vui giải trí may mắn cùng bạn bè
            </p>
          </div>
        </div>

        {/* User Balance and Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Bonus Button */}
          {canClaimDaily && (
            <button
              onClick={handleClaimDaily}
              disabled={dailyClaiming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse hover:opacity-95 transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>+20K$ Điểm Danh</span>
            </button>
          )}

          {/* User Balance Box with Dollar Icon */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-xl shadow-amber-950/40">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow">
              <BadgeDollarSign className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase leading-none">
                {profile.username || 'VIP Player'}
              </div>
              <div className="text-sm sm:text-base font-black text-amber-400 leading-tight flex items-center gap-1">
                <span>{(profile.balance || 0).toLocaleString('vi-VN')}</span>
                <span className="text-xs text-amber-300 font-extrabold">$</span>
              </div>
            </div>
          </div>

          {/* Giftcode Button */}
          <button
            onClick={onOpenGiftCode}
            title="Nhập Giftcode nhận $"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 shadow transition flex items-center gap-1"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Giftcode</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Bảng Xếp Hạng Đại Gia"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow transition flex items-center gap-1"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Xếp Hạng</span>
          </button>

          {/* Casino BGM Music Toggle */}
          <button
            onClick={toggleBgm}
            title={isBgmOn ? 'Tắt nhạc nền Casino' : 'Bật nhạc nền Casino Lounge'}
            className={`p-2 rounded-xl border transition flex items-center gap-1 ${
              isBgmOn
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Music className={`w-4 h-4 ${isBgmOn ? 'animate-bounce text-amber-400' : ''}`} />
            <span className="text-[10px] font-bold hidden md:inline">
              {isBgmOn ? 'Nhạc Bật' : 'Nhạc Tắt'}
            </span>
          </button>

          {/* Sound SFX Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Bật hiệu ứng âm thanh' : 'Tắt hiệu ứng âm thanh'}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
