import React, { useState, useEffect } from 'react';
import Dice from './Dice';
import { Eye, RotateCw } from 'lucide-react';

export default function BowlShaker({
  dice = [1, 2, 3],
  isRolling = false,
  isRevealed = true,
  onReveal,
  roundTimeLeft = null,
  statusMessage = ''
}) {
  const [bowlOffset, setBowlOffset] = useState(0);
  const total = dice[0] + dice[1] + dice[2];

  const isBao = dice[0] === dice[1] && dice[1] === dice[2];
  const isTai = total >= 11 && total <= 17;
  const isXiu = total >= 4 && total <= 10;
  const isChan = total % 2 === 0;

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      {/* Timer / Round Status Badge */}
      {roundTimeLeft !== null && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-400 text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur">
          <RotateCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{statusMessage || `Phiên mới sau: ${roundTimeLeft}s`}</span>
        </div>
      )}

      {/* Main Plate and Bowl Area */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Ornate Gold Outer Rim (Đĩa) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-200 p-2 shadow-2xl shadow-amber-950/80">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 border-4 border-amber-600/70 p-6 flex items-center justify-center relative overflow-hidden">
            {/* Subtle Plate pattern */}
            <div className="absolute inset-4 rounded-full border border-amber-500/20 pointer-events-none"></div>
            <div className="absolute inset-10 rounded-full border border-amber-500/10 pointer-events-none"></div>

            {/* Dice Container inside Plate */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 z-10">
              <Dice value={dice[0]} isRolling={isRolling} size="md" />
              <div className="flex flex-col gap-3">
                <Dice value={dice[1]} isRolling={isRolling} size="md" />
                <Dice value={dice[2]} isRolling={isRolling} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* The Bowl Lid (Bát úp) */}
        <div
          onClick={!isRevealed && !isRolling ? onReveal : undefined}
          className={`absolute inset-4 rounded-full z-20 transition-all duration-700 select-none cursor-pointer ${
            isRolling ? 'animate-bounce shadow-2xl' : ''
          } ${
            !isRevealed
              ? 'opacity-100 scale-100 shadow-2xl'
              : 'opacity-0 -translate-y-24 scale-90 pointer-events-none'
          }`}
          style={{
            background: 'radial-gradient(circle at 35% 30%, #475569 0%, #1e293b 45%, #0f172a 100%)',
            border: '6px solid #d97706',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 4px 8px rgba(255, 255, 255, 0.25)',
          }}
        >
          {/* Bowl Handle / Ornament */}
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-amber-300 shadow-lg flex items-center justify-center mb-2">
              <span className="text-slate-950 font-black text-2xl tracking-widest">LUCKY</span>
            </div>
            
            <p className="text-amber-300 text-sm font-bold tracking-wider uppercase mt-1">
              {isRolling ? 'Đang Lắc...' : 'Bấm để Mở Bát'}
            </p>
            {!isRolling && (
              <span className="flex items-center gap-1.5 text-xs text-amber-200/80 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 mt-2">
                <Eye className="w-3.5 h-3.5" /> Xem kết quả
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Outcome Banner (When revealed) */}
      {isRevealed && !isRolling && (
        <div className="mt-4 flex flex-col items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-amber-400 drop-shadow-md">
              {dice[0]} - {dice[1]} - {dice[2]}
            </span>
            <span className="text-2xl font-bold text-white bg-slate-800/90 border border-slate-700 px-3 py-0.5 rounded-lg shadow">
              = {total}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-black tracking-wider uppercase shadow ${
                isTai ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {isTai ? 'TÀI' : 'XỈU'} ({total >= 11 ? '11-17' : '4-10'})
            </span>

            <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isChan ? 'CHẴN' : 'LẺ'}
            </span>

            {isBao && (
              <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                BÃO {dice[0]}!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
