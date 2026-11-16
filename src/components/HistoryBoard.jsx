import React from 'react';
import { History, TrendingUp } from 'lucide-react';

export default function HistoryBoard({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center text-slate-500 text-sm">
        Chưa có phiên xúc xắc nào. Hãy lắc phiên đầu tiên!
      </div>
    );
  }

  // Calculate statistics over recent rounds
  const recent = history.slice(0, 30);
  const totalRounds = recent.length;
  const taiCount = recent.filter(r => (r.total_score || (r.dice_1 + r.dice_2 + r.dice_3)) >= 11).length;
  const xiuCount = totalRounds - taiCount;
  const taiPercent = totalRounds > 0 ? Math.round((taiCount / totalRounds) * 100) : 50;
  const xiuPercent = 100 - taiPercent;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl backdrop-blur shadow-xl space-y-3">
      {/* Header and Stats Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Lịch Sử & Soi Cầu (30 phiên gần nhất)
          </span>
        </div>

        {/* Statistical Percentages */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-rose-400">Tài: {taiPercent}% ({taiCount})</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400">Xỉu: {xiuPercent}% ({xiuCount})</span>
        </div>
      </div>

      {/* Visual Bead Road (Cầu Tài Xỉu dạng chấm tròn) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {recent.map((round, idx) => {
          const sum = round.total_score || (round.dice_1 + round.dice_2 + round.dice_3);
          const isTai = sum >= 11;
          return (
            <div
              key={round.id || idx}
              title={`Phiên #${idx + 1}: ${round.dice_1}-${round.dice_2}-${round.dice_3} = ${sum} (${isTai ? 'TÀI' : 'XỈU'})`}
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm border ${
                isTai
                  ? 'bg-gradient-to-tr from-rose-600 to-rose-400 border-rose-300'
                  : 'bg-gradient-to-tr from-blue-600 to-blue-400 border-blue-300'
              }`}
            >
              {sum}
            </div>
          );
        })}
      </div>

      {/* Table list of recent rounds */}
      <div className="max-h-44 overflow-y-auto space-y-1 pr-1 text-xs">
        {recent.slice(0, 10).map((r, i) => {
          const sum = r.total_score || (r.dice_1 + r.dice_2 + r.dice_3);
          const isTai = sum >= 11;
          const isChan = sum % 2 === 0;

          return (
            <div
              key={r.id || i}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">#{i + 1}</span>
                <span className="font-bold text-amber-300">
                  [{r.dice_1}, {r.dice_2}, {r.dice_3}]
                </span>
                <span className="text-slate-300 font-bold">= {sum}</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    isTai ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {isTai ? 'TÀI' : 'XỈU'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/60 text-slate-300">
                  {isChan ? 'CHẴN' : 'LẺ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
