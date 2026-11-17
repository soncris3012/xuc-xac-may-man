import React, { useState } from 'react';
import { Users, Radio, Clock, CheckCircle2 } from 'lucide-react';

export default function LivePlayers({
  liveBets = [],
  onlineUsers = [],
  presenceCount = 1,
  currentUserId = null,
}) {
  const [tab, setTab] = useState('bets'); // 'bets' | 'online'

  const pendingBets = liveBets.filter((b) => b.status === 'pending');
  const displayTotalBet = (pendingBets.length > 0 ? pendingBets : liveBets.slice(0, 10)).reduce(
    (sum, b) => sum + Number(b.bet_amount || 0),
    0
  );

  const effectiveOnlineCount = Math.max(presenceCount, onlineUsers.length, 1);

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 p-3 sm:p-4 rounded-2xl backdrop-blur shadow-2xl space-y-3">
      {/* Room Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Phòng Chơi Thời Gian Thực
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span>● {effectiveOnlineCount} người đang trực tuyến</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-300 font-bold">
                {pendingBets.length > 0 ? 'Đang đặt:' : 'Tổng bàn:'} ${displayTotalBet.toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tabs: Lệnh cược vs Người Online */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl text-[10px] font-bold border border-slate-800">
          <button
            type="button"
            onClick={() => setTab('bets')}
            className={`px-2 py-1 rounded-lg transition ${
              tab === 'bets'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cược ({liveBets.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('online')}
            className={`px-2 py-1 rounded-lg transition ${
              tab === 'online'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Online ({effectiveOnlineCount})
          </button>
        </div>
      </div>

      {/* Tab 1: Real-time Bets from public.xucxac_bets */}
      {tab === 'bets' && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
          {liveBets.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              Chưa có lệnh cược nào trên bàn. Hãy đặt cược để mở màn!
            </div>
          ) : (
            liveBets.map((b) => {
              const isTai = b.bet_zone === 'TAI';
              const isXiu = b.bet_zone === 'XIU';
              const isBao = b.bet_zone === 'BAO';
              const isMe = currentUserId && b.user_id === currentUserId;
              const betAmount = Number(b.bet_amount || 0);
              const payout = Number(b.payout || 0);

              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80'
                  }`}
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                      VIP {b.vip_level || 1}
                    </span>
                    <span className="font-bold text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                      {b.username}
                      {isMe && <span className="text-[10px] text-amber-400 ml-1">(Bạn)</span>}
                    </span>
                  </div>

                  {/* Bet Zone & Realtime Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        isTai
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isXiu
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : isBao
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {b.bet_zone.replace('SUM_', 'SỐ ')} (${betAmount.toLocaleString('vi-VN')})
                    </span>

                    {b.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 min-w-[68px] justify-end">
                        <Clock className="w-3 h-3 animate-spin" /> Chờ mở
                      </span>
                    ) : b.status === 'won' ? (
                      <span className="font-black text-[11px] min-w-[68px] text-right text-emerald-400">
                        +${payout.toLocaleString('vi-VN')}
                      </span>
                    ) : (
                      <span className="font-bold text-[11px] min-w-[68px] text-right text-slate-500">
                        -${betAmount.toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Online Users from Supabase Presence & xucxac_users */}
      {tab === 'online' && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
          {onlineUsers.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              Bạn đang có mặt trong phòng VIP ({effectiveOnlineCount} kết nối trực tiếp).
            </div>
          ) : (
            onlineUsers.map((u, idx) => {
              const isMe = currentUserId && u.user_id === currentUserId;
              return (
                <div
                  key={u.user_id || u.username || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      VIP {u.vip_level || 1}
                    </span>
                    <span className="font-bold text-slate-200">
                      {u.username}
                      {isMe && <span className="text-[10px] text-amber-400 ml-1">(Bạn)</span>}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đang trong bàn
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
