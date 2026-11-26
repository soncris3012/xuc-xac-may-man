import React, { useState } from 'react';
import { User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function BettingTable({
  currentBets = {},
  onPlaceBet,
  lastWinningBets = [],
  disabled = false,
  liveBets = [],
  centerContent = null,
}) {
  const [showExtraBets, setShowExtraBets] = useState(false);

  const getBetAmount = (key) => currentBets[key] || 0;
  const isWinning = (key) => lastWinningBets.includes(key);

  // Compute live room bets per zone (pending bets or recent round bets)
  const pending = liveBets.filter((b) => b.status === 'pending');
  const poolSource = pending.length > 0 ? pending : [];

  const getRoomStats = (zone) => {
    const matching = poolSource.filter((b) => b.bet_zone === zone);
    const total = matching.reduce((sum, b) => sum + Number(b.bet_amount || 0), 0);
    const uniqueUsers = new Set(matching.map((b) => b.user_id || b.username)).size;
    return { total, count: uniqueUsers };
  };

  const taiRoom = getRoomStats('TAI');
  const xiuRoom = getRoomStats('XIU');

  const extraActiveCount = Object.entries(currentBets).filter(
    ([k, v]) => k !== 'TAI' && k !== 'XIU' && v > 0
  ).length;

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
      {/* MAIN ROYAL 3-COLUMN STAGE: TÀI | BÁT Ở GIỮA | XỈU */}
      <div className="royal-table-felt w-full rounded-3xl border border-[#b8923a]/50 p-4 sm:p-6 relative overflow-hidden">
        {/* Subtle corner gold accents */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 relative z-10">
          {/* LEFT: TÀI (11 - 17) */}
          <div
            className={`md:col-span-4 flex flex-col items-center text-center p-4 rounded-2xl transition-all ${
              isWinning('TAI')
                ? 'bg-rose-500/15 ring-2 ring-[#f5d061] shadow-[0_0_25px_rgba(245,208,97,0.35)]'
                : 'bg-black/20 border border-white/5'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-wider text-[#f5d061] text-glow">
              TÀI
            </h2>
            <p className="text-xs font-bold text-stone-300 mt-1">11 - 17</p>
            <p className="text-[11px] font-semibold text-[#e5be53]/85 mt-0.5">Tỷ lệ 1 : 1</p>

            {/* Total Room Bet Box */}
            <div className="w-full mt-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2 flex flex-col items-center">
              <span className="text-lg sm:text-xl font-black text-[#f5d061] tracking-wide">
                {taiRoom.total.toLocaleString('vi-VN')}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400 font-semibold mt-0.5">
                <User className="w-3 h-3" /> {taiRoom.count}
              </span>
            </div>

            {/* Player's Own Bet */}
            <div className="mt-2.5 text-xs font-bold text-stone-300">
              Cược của bạn:{' '}
              <span className={getBetAmount('TAI') > 0 ? 'text-emerald-400 font-black' : 'text-stone-400'}>
                {getBetAmount('TAI').toLocaleString('vi-VN')}
              </span>
            </div>

            {/* Gold Action Button: ĐẶT TÀI */}
            <button
              type="button"
              onClick={() => onPlaceBet('TAI')}
              disabled={disabled}
              className="royal-gold-btn w-full mt-3 py-2.5 rounded-xl text-sm font-black tracking-wider text-stone-950 uppercase border border-[#fce08b]/50 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
            >
              ĐẶT TÀI
            </button>
          </div>

          {/* CENTER: BOWL SHAKER + CONTROLS */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            {centerContent}
          </div>

          {/* RIGHT: XỈU (4 - 10) */}
          <div
            className={`md:col-span-4 flex flex-col items-center text-center p-4 rounded-2xl transition-all ${
              isWinning('XIU')
                ? 'bg-sky-500/15 ring-2 ring-[#f5d061] shadow-[0_0_25px_rgba(245,208,97,0.35)]'
                : 'bg-black/20 border border-white/5'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-black tracking-wider text-stone-100 drop-shadow">
              XỈU
            </h2>
            <p className="text-xs font-bold text-stone-300 mt-1">4 - 10</p>
            <p className="text-[11px] font-semibold text-[#e5be53]/85 mt-0.5">Tỷ lệ 1 : 1</p>

            {/* Total Room Bet Box */}
            <div className="w-full mt-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2 flex flex-col items-center">
              <span className="text-lg sm:text-xl font-black text-[#f5d061] tracking-wide">
                {xiuRoom.total.toLocaleString('vi-VN')}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400 font-semibold mt-0.5">
                <User className="w-3 h-3" /> {xiuRoom.count}
              </span>
            </div>

            {/* Player's Own Bet */}
            <div className="mt-2.5 text-xs font-bold text-stone-300">
              Cược của bạn:{' '}
              <span className={getBetAmount('XIU') > 0 ? 'text-emerald-400 font-black' : 'text-stone-400'}>
                {getBetAmount('XIU').toLocaleString('vi-VN')}
              </span>
            </div>

            {/* Gold Action Button: ĐẶT XỈU */}
            <button
              type="button"
              onClick={() => onPlaceBet('XIU')}
              disabled={disabled}
              className="royal-gold-btn w-full mt-3 py-2.5 rounded-xl text-sm font-black tracking-wider text-stone-950 uppercase border border-[#fce08b]/50 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
            >
              ĐẶT XỈU
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT EXPANDABLE SECONDARY BETS BAR (Chẵn / Lẻ / Bão / Tổng 4-17) */}
      <div className="bg-[#150a09]/90 border border-[#b8923a]/25 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExtraBets((prev) => !prev)}
          className="w-full px-4 py-2 flex items-center justify-between text-xs font-bold text-[#e5be53] hover:bg-white/5 transition"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#f5d061]" />
            <span>Cửa Cược Mở Rộng (Chẵn / Lẻ • Bão 1:30 • Đoán Tổng 4-17)</span>
            {extraActiveCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                Đang đặt {extraActiveCount} cửa
              </span>
            )}
          </span>
          {showExtraBets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {(showExtraBets || extraActiveCount > 0) && (
          <div className="p-3 pt-1 space-y-2.5 border-t border-[#b8923a]/15">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onPlaceBet('CHAN')}
                disabled={disabled}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isWinning('CHAN')
                    ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/50'
                    : 'bg-black/35 hover:bg-black/55 border-white/10 hover:border-[#b8923a]/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-sm font-black text-emerald-400">CHẴN</div>
                <div className="text-[10px] text-stone-400">1 : 1</div>
                {getBetAmount('CHAN') > 0 && (
                  <div className="mt-1 text-[10px] font-black text-emerald-300">
                    ${getBetAmount('CHAN').toLocaleString('vi-VN')}
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => onPlaceBet('BAO')}
                disabled={disabled}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isWinning('BAO')
                    ? 'bg-purple-500/25 border-purple-400 ring-2 ring-purple-400/50'
                    : 'bg-black/35 hover:bg-black/55 border-white/10 hover:border-[#b8923a]/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-sm font-black text-purple-300">BÃO</div>
                <div className="text-[10px] text-[#f5d061] font-bold">1 : 30</div>
                {getBetAmount('BAO') > 0 && (
                  <div className="mt-1 text-[10px] font-black text-purple-300">
                    ${getBetAmount('BAO').toLocaleString('vi-VN')}
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => onPlaceBet('LE')}
                disabled={disabled}
                className={`p-2.5 rounded-xl border text-center transition ${
                  isWinning('LE')
                    ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-black/35 hover:bg-black/55 border-white/10 hover:border-[#b8923a]/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-sm font-black text-[#f5d061]">LẺ</div>
                <div className="text-[10px] text-stone-400">1 : 1</div>
                {getBetAmount('LE') > 0 && (
                  <div className="mt-1 text-[10px] font-black text-[#f5d061]">
                    ${getBetAmount('LE').toLocaleString('vi-VN')}
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {sumPayouts.map(({ sum, rate }) => {
                const key = `SUM_${sum}`;
                const betAmt = getBetAmount(key);
                const win = isWinning(key);
                return (
                  <button
                    type="button"
                    key={sum}
                    onClick={() => onPlaceBet(key)}
                    disabled={disabled}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition ${
                      win
                        ? 'bg-amber-500/35 border-[#f5d061] ring-2 ring-[#f5d061]'
                        : 'bg-black/35 hover:bg-black/55 border-white/10 hover:border-[#b8923a]/40'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-black text-white">{sum}</span>
                    <span className="text-[9px] text-[#e5be53] font-bold">{rate}</span>
                    {betAmt > 0 && (
                      <span className="mt-0.5 px-1 rounded bg-[#b88924] text-[9px] text-stone-950 font-black">
                        ${betAmt >= 1000 ? `${Math.round(betAmt / 1000)}k` : betAmt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
