import React, { useState, useEffect } from 'react';
import { Users, Crown, DollarSign, TrendingUp } from 'lucide-react';

const INITIAL_PLAYERS = [
  { id: 1, name: 'ĐạiGia_SàiGòn', vip: 'VIP 8', betZone: 'TAI', betAmount: 150000, lastResult: null },
  { id: 2, name: 'ThầnTài_MayMắn', vip: 'VIP 6', betZone: 'XIU', betAmount: 80000, lastResult: null },
  { id: 3, name: 'VuaXúcXắc_99', vip: 'VIP 5', betZone: 'TAI', betAmount: 100000, lastResult: null },
  { id: 4, name: 'BóngHồng_Casino', vip: 'VIP 7', betZone: 'CHAN', betAmount: 50000, lastResult: null },
  { id: 5, name: 'Tuấn_AllIn', vip: 'VIP 4', betZone: 'XIU', betAmount: 200000, lastResult: null },
  { id: 6, name: 'Hải_ĐỏĐen', vip: 'VIP 3', betZone: 'LE', betAmount: 30000, lastResult: null },
  { id: 7, name: 'LộcPhát_888', vip: 'VIP 5', betZone: 'BAO', betAmount: 20000, lastResult: null },
];

export default function LivePlayers({ lastWinningBets = [], isRolling = false }) {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [onlineCount, setOnlineCount] = useState(148);

  // When rolling ends and winners are decided, update players' win/loss
  useEffect(() => {
    if (lastWinningBets.length > 0 && !isRolling) {
      setPlayers((prev) =>
        prev.map((player) => {
          const won = lastWinningBets.includes(player.betZone);
          const payout = won ? player.betAmount * (player.betZone === 'BAO' ? 30 : 2) : 0;
          return {
            ...player,
            lastResult: won ? `+${payout.toLocaleString('vi-VN')} $` : `-${player.betAmount.toLocaleString('vi-VN')} $`,
            won,
          };
        })
      );

      // Randomize online count slightly
      setOnlineCount((c) => Math.max(120, c + Math.floor(Math.random() * 7) - 3));
    }
  }, [lastWinningBets, isRolling]);

  // When rolling starts, generate new randomized bets for other players in the room
  useEffect(() => {
    if (isRolling) {
      const zones = ['TAI', 'XIU', 'CHAN', 'LE', 'BAO'];
      const amounts = [20000, 50000, 100000, 150000, 250000];

      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          betZone: zones[Math.floor(Math.random() * zones.length)],
          betAmount: amounts[Math.floor(Math.random() * amounts.length)],
          lastResult: null,
        }))
      );
    }
  }, [isRolling]);

  const totalRoomBets = players.reduce((sum, p) => sum + p.betAmount, 0);

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 p-3 sm:p-4 rounded-2xl backdrop-blur shadow-2xl space-y-3">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Phòng Chơi Trực Tiếp (VIP Casino)
            </span>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <span>● {onlineCount} người đang cược</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-300 font-bold">Tổng bàn: ${totalRoomBets.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Players List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
        {players.map((p) => {
          const isTai = p.betZone === 'TAI';
          const isXiu = p.betZone === 'XIU';
          const isBao = p.betZone === 'BAO';

          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 transition"
            >
              {/* Player Info */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {p.vip}
                </span>
                <span className="font-bold text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                  {p.name}
                </span>
              </div>

              {/* Player Bet Zone & Result */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-black text-[10px] ${
                    isTai
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isXiu
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : isBao
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {p.betZone} (${(p.betAmount / 1000).toFixed(0)}k)
                </span>

                {p.lastResult && (
                  <span
                    className={`font-black text-[11px] min-w-[70px] text-right ${
                      p.won ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                    }`}
                  >
                    {p.lastResult}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
