import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import BowlShaker from './components/BowlShaker';
import BettingTable from './components/BettingTable';
import ChipSelector from './components/ChipSelector';
import HistoryBoard from './components/HistoryBoard';
import LivePlayers from './components/LivePlayers';
import GiftCodeModal from './components/GiftCodeModal';
import LeaderboardModal from './components/LeaderboardModal';
import AuthModal from './components/AuthModal';
import { DBService, SUM_MULTIPLIERS } from './services/supabase';
import { sounds } from './services/audio';
import { Play, Sparkles, Clock, Dices, LogIn } from 'lucide-react';

export default function App() {
  // Auth & User Profile State (Thực tế từ Supabase)
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Modals State
  const [isGiftCodeOpen, setIsGiftCodeOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  // Realtime Data State
  const [history, setHistory] = useState([]);
  const [liveBets, setLiveBets] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [presenceCount, setPresenceCount] = useState(1);
  const [totalPool, setTotalPool] = useState(0);

  // Game State
  const [selectedChip, setSelectedChip] = useState(10000);
  const [currentBets, setCurrentBets] = useState({});
  const [dice, setDice] = useState([3, 4, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [isRevealed, setIsRevealed] = useState(true);
  const [lastWinningBets, setLastWinningBets] = useState([]);
  const [roundNotification, setRoundNotification] = useState(null);

  // Game Mode: 'manual' (Lắc ngay) or 'timed' (Phiên tự động 30s)
  const [gameMode, setGameMode] = useState('manual');
  const [timerCount, setTimerCount] = useState(30);

  const timerRef = useRef(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const currentBetsRef = useRef(currentBets);
  currentBetsRef.current = currentBets;

  const isRollingRef = useRef(isRolling);
  isRollingRef.current = isRolling;

  const isRevealedRef = useRef(isRevealed);
  isRevealedRef.current = isRevealed;

  const diceRef = useRef(dice);
  diceRef.current = dice;

  const refreshPoolTotal = useCallback(async () => {
    const leaders = await DBService.getLeaderboard(50);
    const sum = leaders.reduce((acc, u) => acc + Number(u.balance || 0), 0);
    setTotalPool(sum);
  }, []);

  // 1. Khởi tạo dữ liệu thực từ Supabase khi mở trang
  useEffect(() => {
    let active = true;
    async function init() {
      const [user, pastHistory, recentBets, leaders] = await Promise.all([
        DBService.getCurrentUser(),
        DBService.getHistory(30),
        DBService.getLiveBets(20),
        DBService.getLeaderboard(50),
      ]);

      if (!active) return;

      if (user) {
        setProfile(user);
      } else {
        setIsAuthOpen(true);
      }

      setHistory(pastHistory);
      if (pastHistory.length > 0) {
        const latest = pastHistory[0];
        setDice([latest.dice_1, latest.dice_2, latest.dice_3]);
      }

      setLiveBets(recentBets);
      setTotalPool(leaders.reduce((acc, u) => acc + Number(u.balance || 0), 0));
      setAuthLoading(false);
    }
    init();

    return () => {
      active = false;
    };
  }, []);

  // 2. Đăng ký kênh Supabase Realtime (postgres_changes + Presence)
  useEffect(() => {
    const unsubscribe = DBService.subscribeRealtime({
      currentUser: profile,
      onRoundInsert: (newRound) => {
        if (!newRound?.id) return;
        setHistory((prev) => {
          if (prev.some((r) => r.id === newRound.id)) return prev;
          return [newRound, ...prev].slice(0, 30);
        });
      },
      onBetChange: (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setLiveBets((prev) => {
            if (prev.some((b) => b.id === payload.new.id)) return prev;
            return [payload.new, ...prev].slice(0, 20);
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setLiveBets((prev) =>
            prev.map((b) => (b.id === payload.new.id ? payload.new : b))
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setLiveBets((prev) => prev.filter((b) => b.id !== payload.old.id));
        }
      },
      onUserChange: (payload) => {
        setLeaderboardRefresh((n) => n + 1);
        refreshPoolTotal();
        if (
          payload.new &&
          profileRef.current?.id === payload.new.id &&
          !isRollingRef.current &&
          isRevealedRef.current
        ) {
          setProfile(payload.new);
        }
      },
      onPresenceSync: (presenceState) => {
        const flattened = [];
        const seen = new Set();
        Object.entries(presenceState).forEach(([key, entries]) => {
          const item = entries?.[0];
          if (!item) return;
          const uniqueKey = item.user_id || key;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            flattened.push(item);
          }
        });
        setPresenceCount(Math.max(1, Object.keys(presenceState).length));
        setOnlineUsers(flattened);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, [profile?.id, profile?.username, refreshPoolTotal]);

  const totalBetAmount = Object.values(currentBets).reduce((a, b) => a + b, 0);
  const canClaimDaily = DBService.canClaimDaily(profile);

  const handleAuthSuccess = (user) => {
    setProfile(user);
    setIsAuthOpen(false);
    setCurrentBets({});
    setRoundNotification(null);
  };

  const handleLogout = async () => {
    sounds.playClick();
    if (profile?.id) {
      await DBService.clearPendingBets(profile.id);
      await DBService.logout(profile.id);
    }
    setProfile(null);
    setCurrentBets({});
    setIsAuthOpen(true);
  };

  // Chốt phiên & lưu dữ liệu thực lên Supabase
  const handleReveal = useCallback(async (forcedDice = null, baseBalance = null, placedBetsSnapshot = null) => {
    if (isRevealedRef.current || isRollingRef.current) return;

    const activeUser = profileRef.current;
    const activeBets = placedBetsSnapshot || currentBetsRef.current;
    const activeBetTotal = Object.values(activeBets).reduce((a, b) => a + b, 0);

    const currentDice = forcedDice || diceRef.current;
    const currentBaseBal =
      baseBalance !== null ? baseBalance : Number(activeUser?.balance || 0);

    const d1 = currentDice[0];
    const d2 = currentDice[1];
    const d3 = currentDice[2];
    const total = d1 + d2 + d3;

    setIsRevealed(true);
    isRevealedRef.current = true;

    const wins = [];
    const isBao = d1 === d2 && d2 === d3;

    if (total >= 11 && total <= 17) wins.push('TAI');
    if (total >= 4 && total <= 10) wins.push('XIU');
    if (total % 2 === 0) wins.push('CHAN');
    if (total % 2 !== 0) wins.push('LE');
    if (isBao) wins.push('BAO');
    wins.push(`SUM_${total}`);

    setLastWinningBets(wins);

    let totalWinPayout = 0;
    for (const [zone, betAmt] of Object.entries(activeBets)) {
      if (betAmt <= 0) continue;

      if (zone === 'TAI' && wins.includes('TAI')) {
        totalWinPayout += betAmt * 2;
      } else if (zone === 'XIU' && wins.includes('XIU')) {
        totalWinPayout += betAmt * 2;
      } else if (zone === 'CHAN' && wins.includes('CHAN')) {
        totalWinPayout += betAmt * 2;
      } else if (zone === 'LE' && wins.includes('LE')) {
        totalWinPayout += betAmt * 2;
      } else if (zone === 'BAO' && wins.includes('BAO')) {
        totalWinPayout += betAmt * 31;
      } else if (zone.startsWith('SUM_') && wins.includes(zone)) {
        const targetSum = parseInt(zone.replace('SUM_', ''), 10);
        const rate = SUM_MULTIPLIERS[targetSum] || 6;
        totalWinPayout += betAmt * (rate + 1);
      }
    }

    const isWinner = totalWinPayout > 0;
    const newFinalBalance = currentBaseBal + totalWinPayout;

    if (activeUser?.id) {
      const { updatedUser, insertedRound } = await DBService.settleRound({
        user: activeUser,
        dice: [d1, d2, d3],
        totalScore: total,
        betSummary: Object.keys(activeBets).join(', ') || 'NONE',
        totalBetAmount: activeBetTotal,
        isWin: isWinner,
        totalWinPayout,
        newBalance: newFinalBalance,
        winningZones: wins,
      });

      setProfile(updatedUser);
      if (insertedRound) {
        setHistory((prev) => {
          if (prev.some((r) => r.id === insertedRound.id)) return prev;
          return [insertedRound, ...prev].slice(0, 30);
        });
      }
    }

    if (isWinner) {
      sounds.playWin();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setRoundNotification({
        type: 'win',
        text: `🎉 Thắng lớn! Bạn nhận được +$${totalWinPayout.toLocaleString('vi-VN')}!`,
      });
    } else if (activeBetTotal > 0) {
      setRoundNotification({
        type: 'lose',
        text: 'Chưa may mắn! Chúc bạn thắng lớn ở ván kế tiếp.',
      });
    }

    setCurrentBets({});
  }, []);

  // Lắc xúc xắc
  const triggerRoll = useCallback(
    (isAuto = false) => {
      if (isRollingRef.current) return;

      const activeUser = profileRef.current;
      if (!activeUser?.id) {
        if (!isAuto) setIsAuthOpen(true);
        return;
      }

      const activeBets = { ...currentBetsRef.current };
      const betTotal = Object.values(activeBets).reduce((a, b) => a + b, 0);

      if (!isAuto && betTotal === 0) {
        alert('Vui lòng chọn cửa cược trước khi lắc xúc xắc!');
        return;
      }

      if (isAuto && betTotal === 0) {
        return;
      }

      const updatedBalance = Math.max(0, Number(activeUser.balance) - betTotal);
      setProfile((prev) => (prev ? { ...prev, balance: updatedBalance } : prev));

      setIsRolling(true);
      isRollingRef.current = true;
      setIsRevealed(false);
      isRevealedRef.current = false;
      setRoundNotification(null);
      sounds.playDiceShake();

      setTimeout(() => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;

        setDice([d1, d2, d3]);
        diceRef.current = [d1, d2, d3];
        setIsRolling(false);
        isRollingRef.current = false;

        if (isAuto) {
          setTimeout(() => {
            handleReveal([d1, d2, d3], updatedBalance, activeBets);
          }, 2800);
        }
      }, 1800);
    },
    [handleReveal]
  );

  // Bộ đếm ngược phiên tự động 30s
  useEffect(() => {
    if (gameMode !== 'timed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerCount((prev) => {
        if (prev === 6 && !isRollingRef.current) {
          triggerRoll(true);
        }
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, triggerRoll]);

  const handlePlaceBet = async (zoneKey) => {
    if (isRolling || (!isRevealed && gameMode === 'manual')) return;

    if (!profile?.id) {
      sounds.playClick();
      setIsAuthOpen(true);
      return;
    }

    if (Number(profile.balance) < totalBetAmount + selectedChip) {
      sounds.playClick();
      alert('Số dư $ của bạn không đủ để đặt thêm!');
      return;
    }

    sounds.playChip();
    setCurrentBets((prev) => ({
      ...prev,
      [zoneKey]: (prev[zoneKey] || 0) + selectedChip,
    }));

    try {
      await DBService.placeLiveBet({
        userId: profile.id,
        username: profile.username,
        vipLevel: profile.vip_level || 1,
        betZone: zoneKey,
        betAmount: selectedChip,
      });
    } catch (e) {
      console.error('Lỗi đồng bộ lệnh cược:', e);
    }
  };

  const handleClearBets = async () => {
    if (isRolling) return;
    sounds.playClick();
    setCurrentBets({});
    if (profile?.id) {
      await DBService.clearPendingBets(profile.id);
    }
  };

  const handleDoubleBets = async () => {
    if (isRolling || !profile?.id) return;
    const doubledTotal = totalBetAmount * 2;
    if (Number(profile.balance) < doubledTotal) {
      alert('Không đủ số dư để nhân đôi cược!');
      return;
    }

    sounds.playChip();
    const doubled = {};
    for (const key in currentBets) {
      doubled[key] = currentBets[key] * 2;
    }
    setCurrentBets(doubled);

    await DBService.syncPendingBets({
      userId: profile.id,
      username: profile.username,
      vipLevel: profile.vip_level || 1,
      betsMap: doubled,
    });
  };

  const handleAllIn = async () => {
    if (isRolling) return;
    if (!profile?.id) {
      setIsAuthOpen(true);
      return;
    }
    const bal = Number(profile.balance);
    if (bal <= 0) {
      alert('Bạn đã hết $, hãy nhận Giftcode hoặc Điểm danh để chơi tiếp!');
      return;
    }

    sounds.playChip();
    const activeKeys = Object.keys(currentBets);
    const nextBets = activeKeys.length === 1 ? { [activeKeys[0]]: bal } : { TAI: bal };
    setCurrentBets(nextBets);

    await DBService.syncPendingBets({
      userId: profile.id,
      username: profile.username,
      vipLevel: profile.vip_level || 1,
      betsMap: nextBets,
    });
  };

  // Bead road strip stats
  const recentBeads = history.slice(0, 18);
  const taiBeadCount = recentBeads.filter((r) => (r.total_score || r.dice_1 + r.dice_2 + r.dice_3) >= 11).length;
  const xiuBeadCount = recentBeads.length - taiBeadCount;

  // Center stage inside the 3-column Royal Sicbo Table
  const centerStage = (
    <div className="flex flex-col items-center justify-center w-full">
      <BowlShaker
        dice={dice}
        isRolling={isRolling}
        isRevealed={isRevealed}
        onReveal={() => handleReveal()}
        roundTimeLeft={gameMode === 'timed' ? timerCount : null}
        statusMessage={
          isRolling ? 'Đang Lắc...' : timerCount <= 6 && gameMode === 'timed' ? 'Đang nặn mở...' : ''
        }
      />

      {gameMode === 'manual' && (
        <button
          type="button"
          onClick={() => triggerRoll(false)}
          disabled={isRolling || !isRevealed}
          className="royal-gold-btn mt-3 px-6 py-2.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase text-stone-950 border border-[#fce08b]/60 disabled:opacity-45 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-stone-950" />
          <span>{isRolling ? 'Đang Lắc...' : 'LẮC XÚC XẮC'}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#110807] via-[#190a09] to-[#0a0505] text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <Header
        profile={profile}
        onProfileUpdate={setProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenGiftCode={() => setIsGiftCodeOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        canClaimDaily={canClaimDaily}
        totalPool={totalPool}
        roundCount={history.length}
      />

      {/* Banner nhắc đăng nhập nếu chưa đăng nhập */}
      {!authLoading && !profile?.id && (
        <div className="bg-[#b8923a]/15 border-b border-[#b8923a]/30 px-4 py-2 text-center text-xs font-bold text-[#f5d061] flex items-center justify-center gap-2">
          <span>Bạn đang xem bàn trực tiếp. Vui lòng đăng nhập để đặt cược & lưu điểm thời gian thực!</span>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="royal-gold-btn inline-flex items-center gap-1 px-3 py-1 rounded-full text-stone-950 font-black transition"
          >
            <LogIn className="w-3 h-3" /> Đăng Nhập Ngay
          </button>
        </div>
      )}

      {/* Main Royal Casino Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* Top Mode & Status Bar (matches sub-toolbar above Royal table) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">
              {profile?.username ? `Dealer chào ${profile.username} • Đang nhận cược...` : 'Đang nhận cược...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#150a09] border border-[#b8923a]/30 p-1 rounded-full">
            <button
              type="button"
              onClick={() => setGameMode('manual')}
              className={`py-1 px-3 rounded-full text-[11px] font-black flex items-center gap-1.5 transition ${
                gameMode === 'manual'
                  ? 'royal-gold-btn text-stone-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Chơi Tự Do</span>
            </button>

            <button
              type="button"
              onClick={() => setGameMode('timed')}
              className={`py-1 px-3 rounded-full text-[11px] font-black flex items-center gap-1.5 transition ${
                gameMode === 'timed'
                  ? 'royal-gold-btn text-stone-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Phiên 30s</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {roundNotification && (
          <div
            className={`mx-auto max-w-md px-4 py-2 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 animate-bounce ${
              roundNotification.type === 'win'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xl'
                : 'bg-[#1c0f0d] text-stone-300 border border-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f5d061]" />
            <span>{roundNotification.text}</span>
          </div>
        )}

        {/* MAIN 3-COLUMN ROYAL SICBO TABLE (TÀI | BÁT | XỈU) */}
        <BettingTable
          currentBets={currentBets}
          onPlaceBet={handlePlaceBet}
          lastWinningBets={lastWinningBets}
          disabled={isRolling || (!isRevealed && gameMode === 'manual')}
          liveBets={liveBets}
          centerContent={centerStage}
        />

        {/* CASINO CHIP BAR & ALL-IN / x2 / HỦY */}
        <ChipSelector
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          onClearBets={handleClearBets}
          onDoubleBets={handleDoubleBets}
          onAllIn={handleAllIn}
          disabled={isRolling || (!isRevealed && gameMode === 'manual')}
          hasActiveBets={totalBetAmount > 0}
        />

        {/* COMPACT BEAD ROAD STRIP (matches horizontal dotted strip below chips in photo) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#150a09]/95 border border-[#b8923a]/25 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {recentBeads.length === 0 ? (
              <span className="text-[11px] text-stone-500">Chưa có lịch sử cầu</span>
            ) : (
              [...recentBeads].reverse().map((r, idx) => {
                const sum = r.total_score || r.dice_1 + r.dice_2 + r.dice_3;
                const isTai = sum >= 11;
                return (
                  <span
                    key={r.id || idx}
                    title={`${r.dice_1}-${r.dice_2}-${r.dice_3} = ${sum} (${isTai ? 'TÀI' : 'XỈU'})`}
                    className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-black border ${
                      isTai
                        ? 'bg-gradient-to-tr from-rose-700 to-rose-500 text-white border-rose-300/60'
                        : 'bg-stone-800 text-stone-200 border-stone-500/60'
                    }`}
                  >
                    {isTai ? 'T' : 'X'}
                  </span>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold ml-auto">
            <span className="text-[#f5d061]">Tài: {taiBeadCount}</span>
            <span className="text-stone-300">Xỉu: {xiuBeadCount}</span>
          </div>
        </div>

        {/* BOTTOM 2-COLUMN REALTIME & SOI CẦU DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
          <section className="lg:col-span-6">
            <LivePlayers
              liveBets={liveBets}
              onlineUsers={onlineUsers}
              presenceCount={presenceCount}
              currentUserId={profile?.id}
            />
          </section>

          <section className="lg:col-span-6">
            <HistoryBoard history={history} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#b8923a]/20 bg-[#0d0605] py-3.5 text-center text-xs text-stone-500">
        <p>
          Game vui xúc xắc giải trí vui vẻ. Dữ liệu đồng bộ thời gian thực qua Supabase Realtime.
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <GiftCodeModal
        isOpen={isGiftCodeOpen}
        onClose={() => setIsGiftCodeOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        refreshTrigger={leaderboardRefresh}
      />
    </div>
  );
}
