import React from 'react';
import { Trash2, Copy, Zap } from 'lucide-react';

const CHIP_VALUES = [
  { label: '1K', value: 1000, color: 'from-slate-600 to-slate-800 border-slate-400' },
  { label: '5K', value: 5000, color: 'from-blue-600 to-blue-800 border-blue-400' },
  { label: '10K', value: 10000, color: 'from-emerald-600 to-emerald-800 border-emerald-400' },
  { label: '50K', value: 50000, color: 'from-amber-600 to-amber-800 border-amber-400' },
  { label: '100K', value: 100000, color: 'from-purple-600 to-purple-800 border-purple-400' },
  { label: '500K', value: 500000, color: 'from-rose-600 to-rose-800 border-rose-400' },
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
    <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl backdrop-blur shadow-xl">
      {/* Chips Selection */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
          Chọn Xu:
        </span>
        {CHIP_VALUES.map((chip) => {
          const isSelected = selectedChip === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => onSelectChip(chip.value)}
              disabled={disabled}
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full font-black text-xs sm:text-sm text-white bg-gradient-to-b ${chip.color} border-2 shadow-md transition-all transform active:scale-95 ${
                isSelected
                  ? 'ring-4 ring-amber-400 scale-110 z-10 -translate-y-1'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-white/50 flex items-center justify-center">
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
          title="Xóa tất cả cược"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Hủy Cược</span>
        </button>

        <button
          onClick={onDoubleBets}
          disabled={disabled || !hasActiveBets}
          title="Nhân đôi mức cược hiện tại"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>x2 Cược</span>
        </button>

        <button
          onClick={onAllIn}
          disabled={disabled}
          title="Tất tay toàn bộ số xu hiện có"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>TẤT TAY</span>
        </button>
      </div>
    </div>
  );
}
