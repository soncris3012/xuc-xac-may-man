import React from 'react';

export default function Dice({ value = 1, isRolling = false, size = 'md' }) {
  const sizeClasses = {
    xs: 'w-11 h-11 rounded-lg shadow p-1.5',
    sm: 'w-14 h-14 rounded-xl shadow-md p-2',
    md: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl p-2.5',
    lg: 'w-24 h-24 rounded-3xl shadow-2xl p-3',
  }[size] || 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl p-2.5';

  const dotSize = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    lg: 'w-5 h-5',
  }[size] || 'w-3.5 h-3.5 sm:w-4 sm:h-4';

  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${dotSize} bg-rose-600 rounded-full shadow-inner transform scale-125`}></span>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-start">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-start">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between">
              <span className={`${dotSize} bg-rose-600 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-rose-600 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-rose-600 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-rose-600 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-stone-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-[#fffdf8] via-[#f5f0e4] to-[#dfd5c0] border border-[#c9b99b] select-none ${sizeClasses} ${
        isRolling ? 'animate-spin-dice shadow-amber-500/50' : 'transition-transform hover:scale-105'
      }`}
      style={{
        boxShadow: isRolling
          ? '0 0 20px rgba(229, 190, 83, 0.7), inset 0 2px 4px rgba(255,255,255,0.85), inset 0 -3px 6px rgba(0,0,0,0.2)'
          : '0 8px 18px -4px rgba(0, 0, 0, 0.65), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18)',
      }}
    >
      {renderDots()}
    </div>
  );
}
