import React from 'react';
import { Trash2, Copy, Zap, DollarSign } from 'lucide-react';

const CHIP_VALUES = [
  { label: '$1K', value: 1000, color: 'from-slate-700 to-slate-900 border-slate-400' },
  { label: '$5K', value: 5000, color: 'from-blue-700 to-blue-950 border-blue-400' },
  { label: '$10K', value: 10000, color: 'from-emerald-700 to-emerald-950 border-emerald-400' },
  { label: '$50K', value: 50000, color: 'from-amber-600 to-amber-950 border-amber-400' },
  { label: '$100K', value: 100000, color: 'from-purple-700 to-purple-950 border-purple-400' },
  { label: '$500K', value: 500000, color: 'from-rose-700 to-rose-950 border-rose-400' },
];

export default function ChipSelector({
  selectedChip,
  onSelectChip,
  onClearBets,
  onDoubleBets,
  onAllIn,
  disabled = false,
  hasActiveBets = false,
}) {
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border-2 border-amber-500/40 p-3 rounded-2xl backdrop-blur shadow-2xl">
      {/* Casino Dollar Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
        <span className="text-xs font-black text-amber-300 uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-0.5">
          <DollarSign className="w-3.5 h-3.5 inline text-amber-400" />
          <span>Mức Cược:</span>
        </span>
        {CHIP_VALUES.map((chip) => {
          const isSelected = selectedChip === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => onSelectChip(chip.value)}
              disabled={disabled}
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full font-black text-xs sm:text-sm text-white bg-gradient-to-b ${chip.color} border-2 shadow-xl transition-all transform active:scale-95 ${
                isSelected
                  ? 'ring-4 ring-yellow-400 scale-110 z-10 -translate-y-1 shadow-yellow-500/50'
                  : 'hover:scale-105 opacity-90 hover:opacity-100'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-yellow-200/60 flex items-center justify-center shadow-inner">
                {chip.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Clear, Double, All-in */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onClearBets}
          disabled={disabled || !hasActiveBets}
          title="Hủy toàn bộ cược"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Hủy</span>
        </button>

        <button
          onClick={onDoubleBets}
          disabled={disabled || !hasActiveBets}
          title="Nhân đôi mức cược"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>x2</span>
        </button>

        <button
          onClick={onAllIn}
          disabled={disabled}
          title="Tất tay toàn bộ số dư $"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg shadow-rose-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>TẤT TAY</span>
        </button>
      </div>
    </div>
  );
}
