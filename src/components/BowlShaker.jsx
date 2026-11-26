import React, { useState, useEffect, useRef } from 'react';
import Dice from './Dice';
import { Zap } from 'lucide-react';

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

  // Reset bowl to center when a new roll starts
  useEffect(() => {
    if (isRolling) {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isRolling]);

  // Pointer Down (Mouse & Touch) - Can grab from current position and keep dragging
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
        const maxDist = 240;

        let newX = rawX;
        let newY = rawY;
        if (dist > maxDist) {
          newX = (rawX / dist) * maxDist;
          newY = (rawY / dist) * maxDist;
        }

        setDragOffset({ x: newX, y: newY });

        // Only auto-reveal when pulled far enough to clearly uncover all 3 dice (>185px for compact bowl)
        if (dist >= 185) {
          setIsDragging(false);
          onReveal();
        }
      });
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      const currentDist = Math.hypot(dragOffset.x, dragOffset.y);
      if (currentDist >= 185) {
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
    <div className="relative flex flex-col items-center justify-center">
      {/* Top Center Countdown / Status Number (matches "25" in Royal Sicbo) */}
      <div className="h-9 flex items-center justify-center mb-1.5">
        {roundTimeLeft !== null ? (
          <span
            className={`text-2xl sm:text-3xl font-black tracking-wider ${
              roundTimeLeft <= 6 ? 'text-rose-400 animate-pulse' : 'text-[#f5d061] text-glow'
            }`}
          >
            {roundTimeLeft}
          </span>
        ) : (
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#e5be53]/90">
            {isRolling ? 'Đang Lắc...' : !isRevealed ? statusMessage || 'Chờ Mở Bát' : 'Sẵn Sàng'}
          </span>
        )}
      </div>

      {/* Main Plate and Draggable Obsidian Bowl */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
        {/* Outer Recessed Gold-Rimmed Dish (Đĩa) */}
        <div
          className="absolute inset-0 rounded-full p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.9)]"
          style={{
            background: 'linear-gradient(145deg, #6e521b 0%, #2a1d09 45%, #8a6823 100%)',
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1d1110] via-[#120909] to-[#0b0606] border-2 border-[#c59b38]/60 p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-3 rounded-full border border-[#d4af37]/15 pointer-events-none"></div>

            {/* 3 Dice inside Plate */}
            <div className="flex items-center justify-center gap-2.5 z-10">
              <Dice value={dice[0]} isRolling={isRolling} size="sm" />
              <div className="flex flex-col gap-2.5">
                <Dice value={dice[1]} isRolling={isRolling} size="sm" />
                <Dice value={dice[2]} isRolling={isRolling} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Draggable Matte Obsidian Bowl Lid ("發" + "Nặn") */}
        <div
          onPointerDown={handlePointerDown}
          className={`absolute inset-1.5 rounded-full z-20 select-none cursor-grab active:cursor-grabbing ${
            isRolling ? 'animate-bounce shadow-2xl' : ''
          } ${
            !isRevealed
              ? isDragging
                ? 'opacity-100 shadow-2xl'
                : 'opacity-100 shadow-2xl transition-transform duration-150 ease-out'
              : 'opacity-0 -translate-y-36 scale-75 pointer-events-none transition-all duration-500 ease-in-out'
          }`}
          style={{
            transform: !isRevealed
              ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`
              : 'translate3d(0px, -160px, 0)',
            willChange: isDragging ? 'transform' : 'auto',
            background: 'radial-gradient(circle at 35% 30%, #2b2b2e 0%, #17171a 55%, #09090b 100%)',
            border: '4px solid #b58c32',
            boxShadow:
              '0 24px 48px -10px rgba(0, 0, 0, 0.95), inset 0 3px 8px rgba(255, 255, 255, 0.16), inset 0 -6px 14px rgba(0, 0, 0, 0.85)',
            touchAction: 'none',
          }}
        >
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-3 relative pointer-events-none">
            <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 flex items-center justify-center bg-black/25 shadow-inner mb-1">
              <span
                className="text-4xl font-black text-[#e8c35a] drop-shadow-[0_2px_8px_rgba(232,195,90,0.45)] select-none"
                style={{ fontFamily: 'serif' }}
              >
                發
              </span>
            </div>
            <p className="text-[#e8c35a] text-sm font-black tracking-widest uppercase drop-shadow">
              {isRolling ? 'Đang Lắc...' : 'Nặn'}
            </p>
          </div>
        </div>
      </div>

      {/* Instant Open Button when Bowl is closed */}
      {!isRevealed && !isRolling && (
        <div className="mt-3 flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={onReveal}
            className="royal-gold-btn flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black text-stone-950 border border-[#fce08b]/60 transform active:scale-95 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-stone-950" />
            <span>MỞ THẲNG LUÔN</span>
          </button>
        </div>
      )}

      {/* Compact Result Summary when Revealed */}
      {isRevealed && !isRolling && (
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5 bg-black/50 border border-[#b8923a]/40 px-3 py-1 rounded-full shadow">
            <span className="text-sm sm:text-base font-black text-[#f5d061]">
              {dice[0]} - {dice[1]} - {dice[2]}
            </span>
            <span className="text-xs font-black text-white bg-[#2c1512] px-2 py-0.5 rounded-md border border-white/10">
              = {total}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isTai ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'
              }`}
            >
              {isTai ? 'TÀI' : 'XỈU'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#381d18] text-[#f5d061] border border-[#b8923a]/30">
              {isChan ? 'CHẴN' : 'LẺ'}
            </span>
            {isBao && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white animate-pulse">
                BÃO!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
