import React from 'react';

const CHIP_VALUES = [
  { label: '1K', value: 1000, bg: 'from-slate-600 to-slate-800 border-slate-300/70' },
  { label: '5K', value: 5000, bg: 'from-rose-600 to-red-800 border-rose-300/70' },
  { label: '10K', value: 10000, bg: 'from-blue-600 to-indigo-800 border-blue-300/70' },
  { label: '50K', value: 50000, bg: 'from-emerald-600 to-green-800 border-emerald-300/70' },
  { label: '100K', value: 100000, bg: 'from-purple-600 to-violet-900 border-purple-300/70' },
  { label: '500K', value: 500000, bg: 'from-orange-500 to-amber-800 border-orange-300/70' },
  { label: '1M', value: 1000000, bg: 'from-yellow-500 to-amber-700 border-yellow-200/80' },
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
    <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-[#150a09]/95 border border-[#b8923a]/30 px-3.5 py-2.5 rounded-2xl shadow-xl">
      {/* Circular Casino Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
        {CHIP_VALUES.map((chip) => {
          const isSelected = selectedChip === chip.value;
          return (
            <button
              type="button"
              key={chip.value}
              onClick={() => onSelectChip(chip.value)}
              disabled={disabled}
              className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full font-black text-[10px] sm:text-xs text-white bg-gradient-to-b ${chip.bg} border-2 shadow-lg transition-transform active:scale-95 ${
                isSelected
                  ? 'ring-2 ring-[#f5d061] ring-offset-2 ring-offset-[#150a09] -translate-y-1 scale-110 z-10'
                  : 'opacity-85 hover:opacity-100 hover:scale-105'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-dashed border-white/60 flex items-center justify-center">
                {chip.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons: ALL-IN, x2 Cược, Hủy Cược (matching reference image) */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={onAllIn}
          disabled={disabled}
          title="Tất tay toàn bộ số dư $"
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-b from-amber-500 to-orange-600 hover:brightness-110 text-stone-950 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95"
        >
          ALL-IN
        </button>

        <button
          type="button"
          onClick={onDoubleBets}
          disabled={disabled || !hasActiveBets}
          title="Nhân đôi mức cược"
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#241311] hover:bg-[#341c19] text-[#f5d061] border border-[#b8923a]/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          x2 Cược
        </button>

        <button
          type="button"
          onClick={onClearBets}
          disabled={disabled || !hasActiveBets}
          title="Hủy toàn bộ cược"
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-b from-rose-600 to-red-700 hover:brightness-110 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Hủy Cược
        </button>
      </div>
    </div>
  );
}
