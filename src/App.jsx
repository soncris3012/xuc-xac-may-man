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

  // Refs to avoid stale closures inside timers / async callbacks
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

  // 1. Khởi tạo dữ liệu thực từ Supabase khi mở trang
  useEffect(() => {
    let active = true;
    async function init() {
      const [user, pastHistory, recentBets] = await Promise.all([
        DBService.getCurrentUser(),
        DBService.getHistory(30),
        DBService.getLiveBets(20),
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
  }, [profile?.id, profile?.username]);

  const totalBetAmount = Object.values(currentBets).reduce((a, b) => a + b, 0);
  const canClaimDaily = DBService.canClaimDaily(profile);

  // Đăng nhập / Đăng ký thành công
  const handleAuthSuccess = (user) => {
    setProfile(user);
    setIsAuthOpen(false);
    setCurrentBets({});
    setRoundNotification(null);
  };

  // Đăng xuất
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

    // Tính tiền thưởng
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

    // Lưu trực tiếp kết quả phiên lên Supabase
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

  // Đặt cược & đồng bộ lên bảng Realtime
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

  // Hủy cược
  const handleClearBets = async () => {
    if (isRolling) return;
    sounds.playClick();
    setCurrentBets({});
    if (profile?.id) {
      await DBService.clearPendingBets(profile.id);
    }
  };

  // Nhân đôi cược
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

  // Tất tay
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#021812] via-[#042018] to-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        profile={profile}
        onProfileUpdate={setProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenGiftCode={() => setIsGiftCodeOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        canClaimDaily={canClaimDaily}
      />

      {/* Banner nhắc đăng nhập nếu chưa đăng nhập */}
      {!authLoading && !profile?.id && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
          <span>Bạn đang xem bàn trực tiếp. Vui lòng đăng nhập để đặt cược & lưu điểm thời gian thực!</span>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition"
          >
            <LogIn className="w-3 h-3" /> Đăng Nhập Ngay
          </button>
        </div>
      )}

      {/* Main Casino Floor */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Col 1-7): Shaker, Squeeze Bowl, Betting Table, Chips */}
        <section className="lg:col-span-7 flex flex-col items-center gap-4">
          {/* Mode Selector */}
          <div className="w-full flex items-center justify-between bg-slate-950/80 border border-amber-500/30 p-1.5 rounded-2xl shadow-xl">
            <button
              onClick={() => setGameMode('manual')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
                gameMode === 'manual'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dices className="w-4 h-4" />
              <span>Chơi Tự Do (Lắc Ngay)</span>
            </button>

            <button
              onClick={() => setGameMode('timed')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
                gameMode === 'timed'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Phiên Đếm Ngược (30s)</span>
            </button>
          </div>

          {/* Squeeze Bowl Shaker with 360 degree drag */}
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

          {/* Toast Notification */}
          {roundNotification && (
            <div
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce ${
                roundNotification.type === 'win'
                  ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/60'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{roundNotification.text}</span>
            </div>
          )}

          {/* Manual Roll Button */}
          {gameMode === 'manual' && (
            <div className="w-full flex items-center justify-center gap-3">
              <button
                onClick={() => triggerRoll(false)}
                disabled={isRolling || !isRevealed}
                className="w-full max-w-sm py-3.5 rounded-2xl font-black text-base tracking-wider uppercase bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 shadow-2xl shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-98 flex items-center justify-center gap-2 border-2 border-yellow-300"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{isRolling ? 'Đang Lắc Xúc Xắc...' : 'LẮC XÚC XẮC'}</span>
              </button>
            </div>
          )}

          {/* Casino Chip Selector */}
          <ChipSelector
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            onClearBets={handleClearBets}
            onDoubleBets={handleDoubleBets}
            onAllIn={handleAllIn}
            disabled={isRolling || (!isRevealed && gameMode === 'manual')}
            hasActiveBets={totalBetAmount > 0}
          />

          {/* Total Placed Bet Bar */}
          {totalBetAmount > 0 && (
            <div className="w-full text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
              <span>Tổng cược của bạn:</span>
              <span className="font-black text-amber-400 text-sm">
                ${totalBetAmount.toLocaleString('vi-VN')}
              </span>
            </div>
          )}

          {/* Betting Zones Table */}
          <BettingTable
            currentBets={currentBets}
            onPlaceBet={handlePlaceBet}
            lastWinningBets={lastWinningBets}
            disabled={isRolling || (!isRevealed && gameMode === 'manual')}
          />
        </section>

        {/* Right Column (Col 8-12): Realtime Players Board & Soi Cầu Đường */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Live Players Realtime Board */}
          <LivePlayers
            liveBets={liveBets}
            onlineUsers={onlineUsers}
            presenceCount={presenceCount}
            currentUserId={profile?.id}
          />

          {/* Cầu Đường (Trend Line Chart & Bead Road) */}
          <HistoryBoard history={history} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-500/20 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
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
