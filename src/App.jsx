import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import BowlShaker from './components/BowlShaker';
import BettingTable from './components/BettingTable';
import ChipSelector from './components/ChipSelector';
import HistoryBoard from './components/HistoryBoard';
import LivePlayers from './components/LivePlayers';
import GiftCodeModal from './components/GiftCodeModal';
import LeaderboardModal from './components/LeaderboardModal';
import { DBService } from './services/supabase';
import { sounds } from './services/audio';
import { Play, Sparkles, Clock, Dices, DollarSign } from 'lucide-react';

export default function App() {
  // User profile state
  const [profile, setProfile] = useState({
    id: 'guest',
    username: 'VIP_Player',
    balance: 100000,
  });

  // Modals state
  const [isGiftCodeOpen, setIsGiftCodeOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);

  // Game state
  const [selectedChip, setSelectedChip] = useState(10000);
  const [currentBets, setCurrentBets] = useState({});
  const [dice, setDice] = useState([3, 4, 5]);
  const [isRolling, setIsRolling] = useState(false);
  const [isRevealed, setIsRevealed] = useState(true);
  const [lastWinningBets, setLastWinningBets] = useState([]);
  const [history, setHistory] = useState([]);
  const [roundNotification, setRoundNotification] = useState(null);

  // Game Mode: 'manual' (Lắc ngay) or 'timed' (Phiên tự động 30s)
  const [gameMode, setGameMode] = useState('manual');
  const [timerCount, setTimerCount] = useState(30);

  const timerRef = useRef(null);

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      const userProfile = await DBService.getProfile();
      setProfile(userProfile);

      const pastHistory = await DBService.getHistory();
      setHistory(pastHistory);

      setCanClaimDaily(DBService.checkDailyBonus());
    }
    init();
  }, []);

  // Timer loop for 'timed' mode
  useEffect(() => {
    if (gameMode !== 'timed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerCount((prev) => {
        if (prev === 6 && !isRolling) {
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
  }, [gameMode, currentBets, isRolling]);

  // Calculate total bet placed
  const totalBetAmount = Object.values(currentBets).reduce((a, b) => a + b, 0);

  // Place bet on a zone
  const handlePlaceBet = (zoneKey) => {
    if (isRolling || (!isRevealed && gameMode === 'manual')) return;

    if (profile.balance < totalBetAmount + selectedChip) {
      sounds.playClick();
      alert('Số dư $ của bạn không đủ để đặt thêm!');
      return;
    }

    sounds.playChip();
    setCurrentBets((prev) => ({
      ...prev,
      [zoneKey]: (prev[zoneKey] || 0) + selectedChip,
    }));
  };

  // Clear all bets
  const handleClearBets = () => {
    if (isRolling) return;
    sounds.playClick();
    setCurrentBets({});
  };

  // Double all bets
  const handleDoubleBets = () => {
    if (isRolling) return;
    const doubledTotal = totalBetAmount * 2;
    if (profile.balance < doubledTotal) {
      alert('Không đủ số dư để nhân đôi cược!');
      return;
    }

    sounds.playChip();
    const doubled = {};
    for (const key in currentBets) {
      doubled[key] = currentBets[key] * 2;
    }
    setCurrentBets(doubled);
  };

  // All in
  const handleAllIn = () => {
    if (isRolling || profile.balance <= 0) return;
    sounds.playChip();
    const activeKeys = Object.keys(currentBets);
    if (activeKeys.length === 1) {
      setCurrentBets({ [activeKeys[0]]: profile.balance });
    } else {
      setCurrentBets({ TAI: profile.balance });
    }
  };

  // Core Rolling Logic
  const triggerRoll = (isAuto = false) => {
    if (isRolling) return;

    if (!isAuto && totalBetAmount === 0) {
      alert('Vui lòng chọn cửa cược trước khi lắc xúc xắc!');
      return;
    }

    const updatedBalance = profile.balance - totalBetAmount;
    setProfile((prev) => ({ ...prev, balance: Math.max(0, updatedBalance) }));

    setIsRolling(true);
    setIsRevealed(false);
    setRoundNotification(null);
    sounds.playDiceShake();

    // Roll animation duration: 1.8 seconds
    setTimeout(() => {
      // 3 independent fair dice
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;

      setDice([d1, d2, d3]);
      setIsRolling(false);

      if (isAuto) {
        // Auto reveal after 3 seconds in timed mode
        setTimeout(() => {
          handleReveal([d1, d2, d3], updatedBalance);
        }, 2800);
      }
    }, 1800);
  };

  // Reveal Bowl & Calculate Outcome
  const handleReveal = (forcedDice = null, baseBalance = null) => {
    if (isRevealed || isRolling) return;

    const currentDice = forcedDice || dice;
    const currentBaseBal = baseBalance !== null ? baseBalance : profile.balance;

    const d1 = currentDice[0];
    const d2 = currentDice[1];
    const d3 = currentDice[2];
    const total = d1 + d2 + d3;

    setIsRevealed(true);

    // Determine winning zones
    const wins = [];
    const isBao = d1 === d2 && d2 === d3;

    if (total >= 11 && total <= 17) wins.push('TAI');
    if (total >= 4 && total <= 10) wins.push('XIU');
    if (total % 2 === 0) wins.push('CHAN');
    if (total % 2 !== 0) wins.push('LE');
    if (isBao) wins.push('BAO');
    wins.push(`SUM_${total}`);

    setLastWinningBets(wins);

    // Calculate payouts
    let totalWinPayout = 0;
    const sumMultipliers = {
      4: 50, 17: 50,
      5: 20, 16: 20,
      6: 15, 15: 15,
      7: 12, 14: 12,
      8: 8, 13: 8,
      9: 6, 10: 6, 11: 6, 12: 6,
    };

    for (const [zone, betAmt] of Object.entries(currentBets)) {
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
        const rate = sumMultipliers[targetSum] || 6;
        totalWinPayout += betAmt * (rate + 1);
      }
    }

    const isWinner = totalWinPayout > 0;
    const newFinalBalance = currentBaseBal + totalWinPayout;

    // Update profile balance
    DBService.updateBalance(profile, newFinalBalance, isWinner).then((updated) => {
      setProfile(updated);
    });

    // Record round
    const roundRecord = {
      username: profile.username || 'VIP_Player',
      dice_1: d1,
      dice_2: d2,
      dice_3: d3,
      total_score: total,
      outcome_result: total >= 11 ? 'TÀI' : 'XỈU',
      outcome_parity: total % 2 === 0 ? 'CHẴN' : 'LẺ',
      bet_type: Object.keys(currentBets).join(', ') || 'NONE',
      bet_amount: totalBetAmount,
      is_win: isWinner,
      payout: totalWinPayout,
    };

    DBService.recordGame(roundRecord).then((newHistory) => {
      setHistory(newHistory);
    });

    // Win fanfare
    if (isWinner) {
      sounds.playWin();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setRoundNotification({
        type: 'win',
        text: `🎉 Thắng lớn! Bạn nhận được +${totalWinPayout.toLocaleString('vi-VN')} $!`,
      });
    } else if (totalBetAmount > 0) {
      setRoundNotification({
        type: 'lose',
        text: `Chưa may mắn! Chúc bạn thắng lớn ở ván kế tiếp.`,
      });
    }

    setCurrentBets({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#021812] via-[#042018] to-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        profile={profile}
        onProfileUpdate={setProfile}
        onOpenGiftCode={() => setIsGiftCodeOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        canClaimDaily={canClaimDaily}
        setCanClaimDaily={setCanClaimDaily}
      />

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
          <LivePlayers lastWinningBets={lastWinningBets} isRolling={isRolling} />

          {/* Cầu Đường (Trend Line Chart & Bead Road) */}
          <HistoryBoard history={history} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-500/20 bg-slate-950/90 py-4 text-center text-xs text-slate-500">
        <p>
          Game vui xúc xắc giải trí vui vẻ. Điểm số và xu chỉ dùng trong game.
        </p>
      </footer>

      {/* Modals */}
      <GiftCodeModal
        isOpen={isGiftCodeOpen}
        onClose={() => setIsGiftCodeOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
