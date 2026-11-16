import React, { useState } from 'react';
import { History, TrendingUp, BarChart2 } from 'lucide-react';

export default function HistoryBoard({ history = [] }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'list'

  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-amber-500/20 p-4 rounded-2xl text-center text-slate-400 text-xs shadow-xl">
        Chưa có phiên nào. Hãy lắc phiên đầu tiên để tạo đường cầu!
      </div>
    );
  }

  // Slice recent 20 rounds for trend line
  const recent = history.slice(0, 20);
  // Reverse for chronological left-to-right display in the chart
  const chronoRecent = [...recent].reverse();

  // Statistics
  const totalRounds = recent.length;
  const taiCount = recent.filter(r => (r.total_score || (r.dice_1 + r.dice_2 + r.dice_3)) >= 11).length;
  const xiuCount = totalRounds - taiCount;
  const taiPercent = totalRounds > 0 ? Math.round((taiCount / totalRounds) * 100) : 50;
  const xiuPercent = 100 - taiPercent;

  // Streak detection (Cầu bệt)
  let streakType = null;
  let streakCount = 0;
  for (const r of recent) {
    const sum = r.total_score || (r.dice_1 + r.dice_2 + r.dice_3);
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

  // Coordinate mapper: X based on index, Y based on sum (range 3..18)
  const getCoordinates = (sum, idx, totalPoints) => {
    const x = paddingX + (idx / Math.max(1, totalPoints - 1)) * chartWidth;
    // 18 is top (y = paddingY), 3 is bottom (y = paddingY + chartHeight)
    const norm = (sum - 3) / 15; // 0 to 1
    const y = paddingY + (1 - norm) * chartHeight;
    return { x, y };
  };

  // Build SVG path
  const points = chronoRecent.map((r, idx) => {
    const sum = r.total_score || (r.dice_1 + r.dice_2 + r.dice_3);
    const isTai = sum >= 11;
    const isBao = r.dice_1 === r.dice_2 && r.dice_2 === r.dice_3;
    const { x, y } = getCoordinates(sum, idx, chronoRecent.length);
    return { x, y, sum, isTai, isBao, round: r };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 p-3 sm:p-4 rounded-2xl backdrop-blur shadow-2xl space-y-3">
      {/* Header with Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider">
            Soi Cầu Đường & Lịch Sử
          </span>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'chart'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đường Cầu
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
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
          <span className="text-slate-600">|</span>
          <span className="text-blue-400">Xỉu: {xiuPercent}% ({xiuCount})</span>
        </div>

        {streakCount >= 2 && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            🔥 Bệt {streakType} {streakCount} cây liên tiếp!
          </span>
        )}
      </div>

      {/* Tab 1: SVG Trend Line Chart (Đường Cầu) */}
      {activeTab === 'chart' && (
        <div className="w-full overflow-x-auto bg-slate-950/80 border border-slate-800 rounded-xl p-2 relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40">
            {/* Background grid lines */}
            {/* Boundary 10.5 dividing line */}
            <line
              x1={paddingX}
              y1={paddingY + chartHeight * 0.5}
              x2={svgWidth - paddingX}
              y2={paddingY + chartHeight * 0.5}
              stroke="#eab308"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.25"
            />

            {/* Connecting Polyline */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Chart Nodes (Dice Total Points) */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.isBao ? 9 : 8}
                  fill={p.isBao ? '#a855f7' : p.isTai ? '#e11d48' : '#2563eb'}
                  stroke="#ffffff"
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

          {/* Bottom Bead Road (Chấm tròn màu sắc) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
            {recent.map((r, idx) => {
              const sum = r.total_score || (r.dice_1 + r.dice_2 + r.dice_3);
              const isTai = sum >= 11;
              return (
                <div
                  key={r.id || idx}
                  title={`#${idx + 1}: ${r.dice_1}-${r.dice_2}-${r.dice_3} = ${sum}`}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow border ${
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
        </div>
      )}

      {/* Tab 2: Detailed Roll History List */}
      {activeTab === 'list' && (
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
          {recent.map((r, i) => {
            const sum = r.total_score || (r.dice_1 + r.dice_2 + r.dice_3);
            const isTai = sum >= 11;
            const isChan = sum % 2 === 0;

            return (
              <div
                key={r.id || i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">#{i + 1}</span>
                  <span className="font-bold text-amber-300">
                    [{r.dice_1}, {r.dice_2}, {r.dice_3}]
                  </span>
                  <span className="text-white font-extrabold">= {sum}</span>
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      isTai
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {isTai ? 'TÀI' : 'XỈU'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
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
