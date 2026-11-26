import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bnvnjuqsekqwqmoiqvcl.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_EYHOqPwRcb9tSCFxYfBR7Q_kHKF-det';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

const USER_SESSION_KEY = 'xucxac_user_id';

export const SUM_MULTIPLIERS = {
  4: 50, 17: 50,
  5: 20, 16: 20,
  6: 15, 15: 15,
  7: 12, 14: 12,
  8: 8, 13: 8,
  9: 6, 10: 6, 11: 6, 12: 6,
};

function getVietnamTodayString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function calculateBetPayout(betZone, betAmount, winningZones) {
  if (!winningZones.includes(betZone)) return 0;
  if (betZone === 'BAO') return betAmount * 31;
  if (betZone.startsWith('SUM_')) {
    const targetSum = parseInt(betZone.replace('SUM_', ''), 10);
    const rate = SUM_MULTIPLIERS[targetSum] || 6;
    return betAmount * (rate + 1);
  }
  return betAmount * 2;
}

export const DBService = {
  // Đăng ký tài khoản mới trên Supabase
  async register(username, password) {
    const { data, error } = await supabase.rpc('xucxac_register', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return { success: false, message: error.message || 'Lỗi kết nối máy chủ Supabase!' };
    }

    if (data?.success && data?.user?.id) {
      localStorage.setItem(USER_SESSION_KEY, data.user.id);
    }
    return data;
  },

  // Đăng nhập tài khoản
  async login(username, password) {
    const { data, error } = await supabase.rpc('xucxac_login', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return { success: false, message: error.message || 'Lỗi kết nối máy chủ Supabase!' };
    }

    if (data?.success && data?.user?.id) {
      localStorage.setItem(USER_SESSION_KEY, data.user.id);
    }
    return data;
  },

  // Đăng nhập bằng OAuth (Google, Facebook) qua Supabase Auth
  async loginWithOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { success: false, message: error.message || `Không thể đăng nhập bằng ${provider}!` };
    }
    return { success: true };
  },

  // Đồng bộ user từ Supabase Auth sang bảng xucxac_users
  async syncAuthUser() {
    const { data, error } = await supabase.rpc('xucxac_sync_auth_user');
    if (error) {
      return { success: false, message: error.message || 'Lỗi đồng bộ tài khoản!' };
    }
    if (data?.success && data?.user?.id) {
      localStorage.setItem(USER_SESSION_KEY, data.user.id);
    }
    return data;
  },

  // Đăng nhập bằng Email & Mật khẩu (Supabase Auth)
  async loginWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, message: error.message || 'Email hoặc mật khẩu không đúng!' };
    }
    const synced = await this.syncAuthUser();
    if (!synced?.success) return synced;
    return { success: true, user: synced.user, message: 'Đăng nhập thành công!' };
  },

  // Đăng ký bằng Email & Mật khẩu (Supabase Auth)
  async registerWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      return { success: false, message: error.message || 'Không thể đăng ký bằng email này!' };
    }
    if (data?.session) {
      const synced = await this.syncAuthUser();
      if (!synced?.success) return synced;
      return { success: true, user: synced.user, message: 'Đăng ký thành công! Tặng bạn 100,000đ.' };
    }
    return {
      success: true,
      needsConfirmation: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra hộp thư email để xác nhận tài khoản.',
    };
  },

  // Gửi email đặt lại mật khẩu
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      return { success: false, message: error.message || 'Không thể gửi email khôi phục!' };
    }
    return {
      success: true,
      message: 'Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email của bạn!',
    };
  },

  // Đăng xuất
  async logout(userId) {
    localStorage.removeItem(USER_SESSION_KEY);
    await supabase.auth.signOut().catch(() => {});
    if (!userId) return;
    await supabase
      .from('xucxac_users')
      .update({
        is_online: false,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  // Tải thông tin người chơi hiện tại từ Supabase Auth hoặc phiên lưu cục bộ
  async getCurrentUser() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      const synced = await this.syncAuthUser();
      if (synced?.success && synced?.user) {
        return { ...synced.user, is_online: true };
      }
    }

    const storedId = localStorage.getItem(USER_SESSION_KEY);
    if (!storedId) return null;

    const { data, error } = await supabase
      .from('xucxac_users')
      .select('*')
      .eq('id', storedId)
      .single();

    if (error || !data) {
      localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }

    await supabase
      .from('xucxac_users')
      .update({
        is_online: true,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', storedId);

    return { ...data, is_online: true };
  },

  // Ghi nhận lệnh đặt cược trực tiếp lên bảng xucxac_bets (Realtime cho cả phòng thấy)
  async placeLiveBet({ userId, username, vipLevel = 1, betZone, betAmount }) {
    if (!userId || betAmount <= 0) return null;

    const { data: existing } = await supabase
      .from('xucxac_bets')
      .select('*')
      .eq('user_id', userId)
      .eq('bet_zone', betZone)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('xucxac_bets')
        .update({
          bet_amount: existing.bet_amount + betAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('xucxac_bets')
      .insert([
        {
          user_id: userId,
          username,
          vip_level: vipLevel,
          bet_zone: betZone,
          bet_amount: betAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Đồng bộ lại toàn bộ cược pending (dùng cho x2 / Tất tay)
  async syncPendingBets({ userId, username, vipLevel = 1, betsMap }) {
    if (!userId) return;
    await this.clearPendingBets(userId);

    const rows = Object.entries(betsMap)
      .filter(([, amt]) => amt > 0)
      .map(([zone, amt]) => ({
        user_id: userId,
        username,
        vip_level: vipLevel,
        bet_zone: zone,
        bet_amount: amt,
        status: 'pending',
      }));

    if (rows.length > 0) {
      await supabase.from('xucxac_bets').insert(rows);
    }
  },

  // Xóa các cược đang chờ của người chơi khi bấm Hủy
  async clearPendingBets(userId) {
    if (!userId) return;
    await supabase
      .from('xucxac_bets')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'pending');
  },

  // Chốt phiên: cập nhật số dư user, lưu phiên vào xucxac_rounds và chốt trạng thái cược trên xucxac_bets
  async settleRound({
    user,
    dice,
    totalScore,
    betSummary,
    totalBetAmount,
    isWin,
    totalWinPayout,
    newBalance,
    winningZones,
  }) {
    const safeBalance = Math.max(0, newBalance);
    const nextPlayed = (user.total_played || 0) + 1;
    const nextWon = isWin ? (user.total_won || 0) + 1 : (user.total_won || 0);
    const nextVip = Math.min(10, Math.max(1, Math.floor(safeBalance / 200000) + 1));

    const { data: updatedUser, error: userErr } = await supabase
      .from('xucxac_users')
      .update({
        balance: safeBalance,
        total_played: nextPlayed,
        total_won: nextWon,
        vip_level: nextVip,
        is_online: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (userErr) {
      console.error('Lỗi cập nhật số dư user:', userErr);
    }

    const isBao = dice[0] === dice[1] && dice[1] === dice[2];
    const roundPayload = {
      user_id: user.id,
      username: user.username,
      dice_1: dice[0],
      dice_2: dice[1],
      dice_3: dice[2],
      total_score: totalScore,
      outcome_result: totalScore >= 11 ? 'TÀI' : 'XỈU',
      outcome_parity: totalScore % 2 === 0 ? 'CHẴN' : 'LẺ',
      is_bao: isBao,
      bet_type: betSummary || 'NONE',
      bet_amount: totalBetAmount || 0,
      is_win: isWin,
      payout: totalWinPayout || 0,
    };

    const { data: insertedRound, error: roundErr } = await supabase
      .from('xucxac_rounds')
      .insert([roundPayload])
      .select()
      .single();

    if (roundErr) {
      console.error('Lỗi lưu lịch sử phiên:', roundErr);
    }

    // Chốt các lệnh cược đang pending trên bàn (của user và các cược pending hiện có)
    const { data: pendingBets } = await supabase
      .from('xucxac_bets')
      .select('*')
      .eq('status', 'pending');

    if (pendingBets && pendingBets.length > 0) {
      await Promise.all(
        pendingBets.map((bet) => {
          const betPayout = calculateBetPayout(bet.bet_zone, Number(bet.bet_amount), winningZones);
          const won = betPayout > 0;
          return supabase
            .from('xucxac_bets')
            .update({
              status: won ? 'won' : 'lost',
              payout: betPayout,
              round_id: insertedRound?.id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bet.id);
        })
      );
    }

    return {
      updatedUser: updatedUser || {
        ...user,
        balance: safeBalance,
        total_played: nextPlayed,
        total_won: nextWon,
        vip_level: nextVip,
      },
      insertedRound,
    };
  },

  // Lấy lịch sử phiên thực từ Supabase
  async getHistory(limit = 30) {
    const { data, error } = await supabase
      .from('xucxac_rounds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Lỗi tải lịch sử phiên:', error);
      return [];
    }
    return data || [];
  },

  // Lấy danh sách lệnh cược trực tiếp từ Supabase
  async getLiveBets(limit = 20) {
    const { data, error } = await supabase
      .from('xucxac_bets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Lỗi tải danh sách cược realtime:', error);
      return [];
    }
    return data || [];
  },

  // Lấy bảng xếp hạng thực từ Supabase
  async getLeaderboard(limit = 15) {
    const { data, error } = await supabase
      .from('xucxac_users')
      .select('id, username, balance, vip_level, total_won, total_played, is_online')
      .order('balance', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Lỗi tải bảng xếp hạng:', error);
      return [];
    }
    return data || [];
  },

  // Nhập Giftcode thực qua RPC
  async redeemCode(code, userId) {
    const { data, error } = await supabase.rpc('xucxac_redeem_giftcode', {
      p_user_id: userId,
      p_code: code,
    });

    if (error) {
      return { success: false, message: error.message || 'Lỗi xác thực mã quà tặng!' };
    }
    return data;
  },

  // Kiểm tra người chơi đã điểm danh hôm nay chưa
  canClaimDaily(user) {
    if (!user?.id) return false;
    if (!user.last_daily_claim) return true;
    return user.last_daily_claim < getVietnamTodayString();
  },

  // Nhận thưởng điểm danh qua RPC
  async claimDailyBonus(userId) {
    const { data, error } = await supabase.rpc('xucxac_claim_daily', {
      p_user_id: userId,
    });

    if (error) {
      return { success: false, message: error.message || 'Lỗi điểm danh nhận thưởng!' };
    }
    return data;
  },

  // Đăng ký kênh Supabase Realtime (postgres_changes + Presence)
  subscribeRealtime({ onRoundInsert, onBetChange, onUserChange, onPresenceSync, currentUser }) {
    const presenceKey =
      currentUser?.id || `viewer_${Math.random().toString(36).slice(2, 10)}`;

    const channel = supabase.channel('xucxac-casino-room', {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'xucxac_rounds' },
        (payload) => {
          onRoundInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'xucxac_bets' },
        (payload) => {
          onBetChange?.(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'xucxac_users' },
        (payload) => {
          onUserChange?.(payload);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onPresenceSync?.(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser?.id || null,
            username: currentUser?.username || 'Khách xem bàn',
            vip_level: currentUser?.vip_level || 1,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
