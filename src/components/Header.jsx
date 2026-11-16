import React, { useState } from 'react';
import { Coins, Volume2, VolumeX, Gift, Trophy, CalendarCheck, Database, Cloud } from 'lucide-react';
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
  const [dailyClaiming, setDailyClaiming] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
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
    <header className="w-full bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🎲</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                XÚC XẮC MAY MẮN
              </h1>
              {/* Storage Mode Badge */}
              <span
                title={
                  isSupabaseConfigured
                    ? 'Đã kết nối cơ sở dữ liệu Supabase Cloud'
                    : 'Đang chạy chế độ LocalStorage (Tự lưu trình duyệt)'
                }
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isSupabaseConfigured ? <Cloud className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                <span className="hidden sm:inline">{isSupabaseConfigured ? 'Supabase' : 'Offline'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Mini-game mô phỏng xác suất giải trí lành mạnh</p>
          </div>
        </div>

        {/* User Balance and Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Bonus Button */}
          {canClaimDaily && (
            <button
              onClick={handleClaimDaily}
              disabled={dailyClaiming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md animate-pulse hover:opacity-95 transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>+20K Điểm Danh</span>
            </button>
          )}

          {/* User Balance Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-amber-500/30 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase leading-none">
                {profile.username || 'Khách'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-amber-400 leading-tight">
                {(profile.balance || 0).toLocaleString('vi-VN')}{' '}
                <span className="text-[10px] text-amber-200/70 font-semibold">Xu</span>
              </div>
            </div>
          </div>

          {/* Giftcode Button */}
          <button
            onClick={onOpenGiftCode}
            title="Nhập Giftcode"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center gap-1"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Giftcode</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Bảng Xếp Hạng"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Xếp Hạng</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
