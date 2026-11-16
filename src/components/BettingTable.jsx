import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function BettingTable({
  currentBets = {},
  onPlaceBet,
  lastWinningBets = [],
  disabled = false,
}) {
  const getBetAmount = (key) => currentBets[key] || 0;
  const isWinning = (key) => lastWinningBets.includes(key);

  // Exact sum payouts
  const sumPayouts = [
    { sum: 4, rate: '1:50' },
    { sum: 5, rate: '1:20' },
    { sum: 6, rate: '1:15' },
    { sum: 7, rate: '1:12' },
    { sum: 8, rate: '1:8' },
    { sum: 9, rate: '1:6' },
    { sum: 10, rate: '1:6' },
    { sum: 11, rate: '1:6' },
    { sum: 12, rate: '1:6' },
    { sum: 13, rate: '1:8' },
    { sum: 14, rate: '1:12' },
    { sum: 15, rate: '1:15' },
    { sum: 16, rate: '1:20' },
    { sum: 17, rate: '1:50' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Primary Zones: TÀI vs XỈU */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* XỈU (4 - 10) */}
        <button
          onClick={() => onPlaceBet('XIU')}
          disabled={disabled}
          className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 transition-all transform active:scale-98 ${
            isWinning('XIU')
              ? 'bg-blue-600/30 border-blue-400 ring-4 ring-blue-500/50 scale-102'
              : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-blue-500/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-2xl sm:text-3xl font-black text-blue-400 tracking-wider">
            XỈU
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
            4 - 10 Điểm • Tỷ lệ 1:1
          </span>

          {/* Active Bet Badge */}
          {getBetAmount('XIU') > 0 && (
            <div className="mt-2 px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-1 animate-pulse">
              <span>{getBetAmount('XIU').toLocaleString('vi-VN')} Xu</span>
            </div>
          )}
        </button>

        {/* TÀI (11 - 17) */}
        <button
          onClick={() => onPlaceBet('TAI')}
          disabled={disabled}
          className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 transition-all transform active:scale-98 ${
            isWinning('TAI')
              ? 'bg-rose-600/30 border-rose-400 ring-4 ring-rose-500/50 scale-102'
              : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-rose-500/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-wider">
            TÀI
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
            11 - 17 Điểm • Tỷ lệ 1:1
          </span>

          {/* Active Bet Badge */}
          {getBetAmount('TAI') > 0 && (
            <div className="mt-2 px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-1 animate-pulse">
              <span>{getBetAmount('TAI').toLocaleString('vi-VN')} Xu</span>
            </div>
          )}
        </button>
      </div>

      {/* Secondary Zones: CHẴN, BÃO (TRIPLES), LẺ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* CHẴN */}
        <button
          onClick={() => onPlaceBet('CHAN')}
          disabled={disabled}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
            isWinning('CHAN')
              ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500'
              : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/60 hover:border-emerald-500/40'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg sm:text-xl font-black text-emerald-400">CHẴN</span>
          <span className="text-[11px] text-slate-400 font-medium">1 : 1</span>
          {getBetAmount('CHAN') > 0 && (
            <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs">
              {getBetAmount('CHAN').toLocaleString('vi-VN')}
            </div>
          )}
        </button>

        {/* BÃO (Bộ 3 giống nhau: 1-1-1, 6-6-6...) */}
        <button
          onClick={() => onPlaceBet('BAO')}
          disabled={disabled}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
            isWinning('BAO')
              ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-500'
              : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/60 hover:border-purple-500/40'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-lg sm:text-xl font-black text-purple-400">BÃO</span>
          </div>
          <span className="text-[11px] text-amber-300 font-bold">1 : 30</span>
          {getBetAmount('BAO') > 0 && (
            <div className="mt-1 px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-xs">
              {getBetAmount('BAO').toLocaleString('vi-VN')}
            </div>
          )}
        </button>

        {/* LẺ */}
        <button
          onClick={() => onPlaceBet('LE')}
          disabled={disabled}
          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
            isWinning('LE')
              ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500'
              : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/60 hover:border-amber-500/40'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg sm:text-xl font-black text-amber-400">LẺ</span>
          <span className="text-[11px] text-slate-400 font-medium">1 : 1</span>
          {getBetAmount('LE') > 0 && (
            <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-xs">
              {getBetAmount('LE').toLocaleString('vi-VN')}
            </div>
          )}
        </button>
      </div>

      {/* Tertiary: Dự đoán Tổng Điểm Chính Xác (4 -> 17) */}
      <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Đoán Tổng Điểm Chính Xác (4 - 17)
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Thưởng cao theo xác suất</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {sumPayouts.map(({ sum, rate }) => {
            const key = `SUM_${sum}`;
            const betAmt = getBetAmount(key);
            const win = isWinning(key);

            return (
              <button
                key={sum}
                onClick={() => onPlaceBet(key)}
                disabled={disabled}
                className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all ${
                  win
                    ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400 font-extrabold'
                    : 'bg-slate-800/70 hover:bg-slate-700/80 border-slate-700 hover:border-amber-500/30'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="text-sm sm:text-base font-black text-white">{sum}</span>
                <span className="text-[10px] text-amber-300 font-semibold">{rate}</span>
                {betAmt > 0 && (
                  <span className="mt-0.5 px-1 py-0.2 rounded bg-amber-600 text-[9px] text-white font-bold truncate max-w-full">
                    {betAmt >= 1000 ? `${Math.round(betAmt / 1000)}k` : betAmt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
