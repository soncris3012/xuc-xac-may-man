import React, { useState, useEffect, useRef } from 'react';
import Dice from './Dice';
import { RotateCw, Zap } from 'lucide-react';

export default function BowlShaker({
  dice = [1, 2, 3],
  isRolling = false,
  isRevealed = true,
  onReveal,
  roundTimeLeft = null,
  statusMessage = '',
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const total = dice[0] + dice[1] + dice[2];
  const isBao = dice[0] === dice[1] && dice[1] === dice[2];
  const isTai = total >= 11 && total <= 17;
  const isChan = total % 2 === 0;

  // Reset drag position when round starts or rolls
  useEffect(() => {
    if (isRolling || !isRevealed) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [isRolling, isRevealed]);

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e) => {
    if (isRevealed || isRolling) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    };
  };

  // Pointer Move (Optimized with requestAnimationFrame for 60fps/120fps smooth drag)
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || isRevealed || isRolling) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rawX = e.clientX - dragStartRef.current.x;
        const rawY = e.clientY - dragStartRef.current.y;
        const dist = Math.hypot(rawX, rawY);
        const maxDist = 160;

        let newX = rawX;
        let newY = rawY;
        if (dist > maxDist) {
          newX = (rawX / dist) * maxDist;
          newY = (rawY / dist) * maxDist;
        }

        setDragOffset({ x: newX, y: newY });

        // If dragged past 120px, reveal
        if (dist >= 120) {
          setIsDragging(false);
          onReveal();
        }
      });
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const dist = Math.hypot(dragOffset.x, dragOffset.y);
      if (dist > 80) {
        onReveal();
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, dragOffset, isRevealed, isRolling, onReveal]);

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      {/* Timer / Round Status Badge */}
      {roundTimeLeft !== null && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl backdrop-blur">
          <RotateCw className={`w-4 h-4 text-amber-400 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{statusMessage || `Phiên mới sau: ${roundTimeLeft}s`}</span>
        </div>
      )}

      {/* Main Plate and Bowl Area */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Luxury Gold Casino Outer Rim (Đĩa ngọc viền vàng) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-800 via-amber-500 to-amber-200 p-2 shadow-2xl shadow-black">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-emerald-950 via-[#032b1f] to-slate-950 border-4 border-amber-500/80 p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
            {/* Casino felt diamond pattern */}
            <div className="absolute inset-4 rounded-full border border-amber-500/20 pointer-events-none"></div>
            <div className="absolute inset-10 rounded-full border border-amber-500/10 pointer-events-none"></div>

            {/* 3 Dice inside Plate */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 z-10">
              <Dice value={dice[0]} isRolling={isRolling} size="md" />
              <div className="flex flex-col gap-3">
                <Dice value={dice[1]} isRolling={isRolling} size="md" />
                <Dice value={dice[2]} isRolling={isRolling} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* The Draggable Squeeze Bowl Lid (Bát úp nặn 360 độ siêu mượt) */}
        <div
          onPointerDown={handlePointerDown}
          className={`absolute inset-4 rounded-full z-20 select-none cursor-grab active:cursor-grabbing ${
            isRolling ? 'animate-bounce shadow-2xl' : ''
          } ${
            !isRevealed
              ? isDragging
                ? 'opacity-100 shadow-2xl'
                : 'opacity-100 shadow-2xl transition-transform duration-200 ease-out'
              : 'opacity-0 -translate-y-36 scale-75 pointer-events-none transition-all duration-500 ease-in-out'
          }`}
          style={{
            transform: !isRevealed
              ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`
              : 'translate3d(0px, -150px, 0)',
            willChange: isDragging ? 'transform' : 'auto',
            background: 'radial-gradient(circle at 35% 30%, #334155 0%, #1e293b 45%, #090d16 100%)',
            border: '6px solid #f59e0b',
            boxShadow:
              '0 30px 60px -15px rgba(0, 0, 0, 0.95), inset 0 4px 10px rgba(255, 255, 255, 0.3)',
            touchAction: 'none',
          }}
        >
          {/* Bowl Gold Ornament */}
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4 relative pointer-events-none">
            {/* Center Gold Crest */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-amber-300 shadow-xl flex items-center justify-center mb-2">
              <span className="text-slate-950 font-black text-2xl tracking-widest">$VIP$</span>
            </div>

            {/* Just "Nặn" as requested, no %, no subtext */}
            <p className="text-amber-300 text-lg sm:text-xl font-black tracking-widest uppercase drop-shadow">
              {isRolling ? 'Đang Lắc...' : 'Nặn'}
            </p>
          </div>
        </div>
      </div>

      {/* Instant Open Button */}
      {!isRevealed && !isRolling && (
        <div className="mt-3 flex items-center gap-2 animate-fade-in z-30">
          <button
            onClick={onReveal}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 transform active:scale-95 transition"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>MỞ THẲNG LUÔN</span>
          </button>
        </div>
      )}

      {/* Outcome Banner (When revealed) */}
      {isRevealed && !isRolling && (
        <div className="mt-4 flex flex-col items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-lg">
              {dice[0]} - {dice[1]} - {dice[2]}
            </span>
            <span className="text-2xl font-black text-white bg-slate-900/90 border border-amber-500/50 px-3 py-0.5 rounded-xl shadow-lg">
              = {total}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-4 py-1 rounded-full text-sm font-black tracking-widest uppercase shadow-lg ${
                isTai ? 'bg-rose-600 text-white shadow-rose-900/50' : 'bg-blue-600 text-white shadow-blue-900/50'
              }`}
            >
              {isTai ? 'TÀI' : 'XỈU'} ({total >= 11 ? '11 - 17' : '4 - 10'})
            </span>

            <span className="px-3 py-1 rounded-full text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow">
              {isChan ? 'CHẴN' : 'LẺ'}
            </span>

            {isBao && (
              <span className="px-3.5 py-1 rounded-full text-sm font-black bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white animate-pulse shadow-lg">
                👑 BÃO {dice[0]}!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
