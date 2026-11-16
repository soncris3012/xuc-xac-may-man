import React from 'react';

export default function Dice({ value = 1, isRolling = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12 rounded-xl shadow-md p-1.5',
    md: 'w-20 h-20 rounded-2xl shadow-xl p-2.5',
    lg: 'w-24 h-24 rounded-3xl shadow-2xl p-3',
  }[size] || 'w-20 h-20 rounded-2xl shadow-xl p-2.5';

  const dotSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size] || 'w-4 h-4';

  // Render dots layout for 1-6
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
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-start">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
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
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
              <span className={`${dotSize} bg-slate-900 rounded-full shadow-inner`}></span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-white via-slate-100 to-slate-200 border-2 border-slate-300 select-none ${sizeClasses} ${
        isRolling ? 'animate-spin-dice shadow-amber-500/50' : 'transition-transform hover:scale-105'
      }`}
      style={{
        boxShadow: isRolling
          ? '0 0 20px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.15)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.15)',
      }}
    >
      {renderDots()}
    </div>
  );
}
