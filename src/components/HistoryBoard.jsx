import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function HistoryBoard({ history = [] }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'list'

  if (!history || history.length === 0) {
    return (
      <div className="bg-[#150a09]/90 border border-[#b8923a]/30 p-4 rounded-2xl text-center text-stone-400 text-xs shadow-xl">
        Chưa có phiên nào. Hãy lắc phiên đầu tiên để tạo đường cầu!
      </div>
    );
  }

  const recent = history.slice(0, 20);
  const chronoRecent = [...recent].reverse();

  const totalRounds = recent.length;
  const taiCount = recent.filter((r) => (r.total_score || r.dice_1 + r.dice_2 + r.dice_3) >= 11).length;
  const xiuCount = totalRounds - taiCount;
  const taiPercent = totalRounds > 0 ? Math.round((taiCount / totalRounds) * 100) : 50;
  const xiuPercent = 100 - taiPercent;

  // Streak detection (Cầu bệt)
  let streakType = null;
  let streakCount = 0;
  for (const r of recent) {
    const sum = r.total_score || r.dice_1 + r.dice_2 + r.dice_3;
    const type = sum >= 11 ? 'TÀI' : 'XỈU';
    if (!streakType) {
      streakType = type;
      streakCount = 1;
    } else if (streakType === type) {
      streakCount++;
    } else {
      break;
    }
  }

  // SVG Chart Dimensions
  const svgWidth = 420;
  const svgHeight = 150;
  const paddingX = 24;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getCoordinates = (sum, idx, totalPoints) => {
    const x = paddingX + (idx / Math.max(1, totalPoints - 1)) * chartWidth;
    const norm = (sum - 3) / 15;
    const y = paddingY + (1 - norm) * chartHeight;
    return { x, y };
  };

  const points = chronoRecent.map((r, idx) => {
    const sum = r.total_score || r.dice_1 + r.dice_2 + r.dice_3;
    const isTai = sum >= 11;
    const isBao = r.dice_1 === r.dice_2 && r.dice_2 === r.dice_3;
    const { x, y } = getCoordinates(sum, idx, chronoRecent.length);
    return { x, y, sum, isTai, isBao, round: r };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full bg-[#150a09]/95 border border-[#b8923a]/30 p-3 sm:p-4 rounded-2xl backdrop-blur shadow-2xl space-y-3">
      {/* Header with Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#f5d061]" />
          <span className="text-xs sm:text-sm font-extrabold text-[#f5d061] uppercase tracking-wider">
            Soi Cầu Đường & Lịch Sử
          </span>
        </div>

        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl text-[11px] font-bold border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'chart'
                ? 'royal-gold-btn text-stone-950 font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Đường Cầu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'list'
                ? 'royal-gold-btn text-stone-950 font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Chi Tiết
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold px-1">
        <div className="flex items-center gap-2">
          <span className="text-rose-400">Tài: {taiPercent}% ({taiCount})</span>
          <span className="text-stone-600">|</span>
          <span className="text-sky-400">Xỉu: {xiuPercent}% ({xiuCount})</span>
        </div>

        {streakCount >= 2 && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-[#b8923a]/20 text-[#f5d061] border border-[#b8923a]/40 animate-pulse">
            🔥 Bệt {streakType} {streakCount} cây liên tiếp!
          </span>
        )}
      </div>

      {/* Tab 1: SVG Trend Line Chart */}
      {activeTab === 'chart' && (
        <div className="w-full overflow-x-auto bg-black/45 border border-white/10 rounded-xl p-2 relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40">
            <line
              x1={paddingX}
              y1={paddingY + chartHeight * 0.5}
              x2={svgWidth - paddingX}
              y2={paddingY + chartHeight * 0.5}
              stroke="#e5be53"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.25"
            />

            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#royalLineGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            <defs>
              <linearGradient id="royalLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#f5d061" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.isBao ? 9 : 8}
                  fill={p.isBao ? '#a855f7' : p.isTai ? '#e11d48' : '#2563eb'}
                  stroke="#fce08b"
                  strokeWidth="1.5"
                />
                <text
                  x={p.x}
                  y={p.y + 3.5}
                  fontSize="8"
                  fontWeight="black"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {p.sum}
                </text>
              </g>
            ))}
          </svg>

          {/* Bottom Bead Road */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/10">
            {recent.map((r, idx) => {
              const sum = r.total_score || r.dice_1 + r.dice_2 + r.dice_3;
              const isTai = sum >= 11;
              return (
                <div
                  key={r.id || idx}
                  title={`#${idx + 1}: ${r.dice_1}-${r.dice_2}-${r.dice_3} = ${sum}`}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow border ${
                    isTai
                      ? 'bg-gradient-to-tr from-rose-700 to-rose-500 border-rose-300/70'
                      : 'bg-gradient-to-tr from-stone-800 to-stone-600 border-stone-400/60'
                  }`}
                >
                  {sum}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Detailed Roll History List */}
      {activeTab === 'list' && (
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
          {recent.map((r, i) => {
            const sum = r.total_score || r.dice_1 + r.dice_2 + r.dice_3;
            const isTai = sum >= 11;
            const isChan = sum % 2 === 0;

            return (
              <div
                key={r.id || i}
                className="flex items-center justify-between p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">#{i + 1}</span>
                  <span className="font-bold text-[#f5d061]">
                    [{r.dice_1}, {r.dice_2}, {r.dice_3}]
                  </span>
                  <span className="text-white font-extrabold">= {sum}</span>
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      isTai
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    }`}
                  >
                    {isTai ? 'TÀI' : 'XỈU'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300 border border-stone-700">
                    {isChan ? 'CHẴN' : 'LẺ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
