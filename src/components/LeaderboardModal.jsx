import React, { useEffect, useState } from 'react';
import { Trophy, X, Sparkles, Radio } from 'lucide-react';
import { DBService } from '../services/supabase';

export default function LeaderboardModal({ isOpen, onClose, refreshTrigger = 0 }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen, refreshTrigger]);

  const loadLeaderboard = async () => {
    if (leaders.length === 0) setLoading(true);
    const data = await DBService.getLeaderboard(15);
    setLeaders(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Bảng Xếp Hạng Đại Gia</h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> REALTIME
              </span>
            </div>
            <p className="text-xs text-slate-400">Cập nhật trực tiếp từ Supabase Database</p>
          </div>
        </div>

        {/* Leaders List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Đang tải bảng xếp hạng...</div>
          ) : leaders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Chưa có người chơi trên hệ thống</div>
          ) : (
            leaders.map((player, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={player.id || player.username || idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    isTop1
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : isTop2
                      ? 'bg-slate-700/30 border-slate-600/40 text-slate-200'
                      : isTop3
                      ? 'bg-amber-900/20 border-amber-800/40 text-amber-400'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        isTop1
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : isTop2
                          ? 'bg-slate-300 text-slate-950'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <span>{player.username}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP {player.vip_level || 1}
                        </span>
                        {isTop1 && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                        {player.is_online && (
                          <span
                            title="Đang online"
                            className="w-2 h-2 rounded-full bg-emerald-400 inline-block"
                          ></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {player.total_won || 0} thắng / {player.total_played || 0} ván
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-amber-400">
                      ${Number(player.balance || 0).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-[10px] text-slate-500">Số dư</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
