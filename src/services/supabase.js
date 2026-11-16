import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// LocalStorage Fallback Storage Keys
const STORAGE_KEYS = {
  PROFILE: 'xucxac_user_profile',
  HISTORY: 'xucxac_game_history',
  LEADERBOARD: 'xucxac_leaderboard',
  REDEEMED_CODES: 'xucxac_redeemed_codes',
  LAST_DAILY: 'xucxac_last_daily_claim',
};

// Default Guest Profile
const DEFAULT_PROFILE = {
  id: 'guest-player',
  username: 'Người Chơi May Mắn',
  balance: 100000,
  total_played: 0,
  total_won: 0,
};

// Initial Mock Leaderboard
const DEFAULT_LEADERBOARD = [
  { username: 'ĐạiGiaXúcXắc', balance: 5800000, total_won: 142 },
  { username: 'ThầnMayMắn99', balance: 3450000, total_won: 89 },
  { username: 'LắcLàTrúng', balance: 2100000, total_won: 65 },
  { username: 'VuaTaiXiu', balance: 1850000, total_won: 51 },
  { username: 'BảoBốiDora', balance: 920000, total_won: 28 },
];

export const DBService = {
  // Get or initialize user profile
  async getProfile() {
    if (isSupabaseConfigured && supabase) {
      try {
        let storedId = localStorage.getItem('xucxac_user_uuid');
        if (storedId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', storedId)
            .single();

          if (data && !error) return data;
        }

        // Create new guest profile in Supabase
        const guestName = 'NgườiChơi_' + Math.floor(1000 + Math.random() * 9000);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ username: guestName, balance: 100000 }])
          .select()
          .single();

        if (newProfile && !insertError) {
          localStorage.setItem('xucxac_user_uuid', newProfile.id);
          return newProfile;
        }
      } catch (e) {
        console.warn('Supabase profile fetch error, fallback to local storage:', e);
      }
    }

    // LocalStorage Fallback
    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  },

  // Update profile balance
  async updateBalance(profile, newBalance, isWin) {
    const updated = {
      ...profile,
      balance: Math.max(0, newBalance),
      total_played: (profile.total_played || 0) + 1,
      total_won: isWin ? (profile.total_won || 0) + 1 : (profile.total_won || 0),
    };

    if (isSupabaseConfigured && supabase && profile.id !== 'guest-player') {
      try {
        await supabase
          .from('profiles')
          .update({
            balance: updated.balance,
            total_played: updated.total_played,
            total_won: updated.total_won,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      } catch (e) {
        console.warn('Supabase update balance error:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // Save game round
  async recordGame(roundData) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('game_history').insert([roundData]);
      } catch (e) {
        console.warn('Supabase save round error:', e);
      }
    }

    // Always keep recent 50 rounds locally for instant UI render
    const localHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    localHistory.unshift({ ...roundData, id: Date.now().toString(), created_at: new Date().toISOString() });
    if (localHistory.length > 50) localHistory.pop();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(localHistory));
    return localHistory;
  },

  // Get game history
  async getHistory() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('game_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (data && !error && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase get history error:', e);
      }
    }

    const localHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return localHistory ? JSON.parse(localHistory) : [];
  },

  // Get leaderboard
  async getLeaderboard() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, balance, total_won')
          .order('balance', { ascending: false })
          .limit(10);

        if (data && !error && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase leaderboard fetch error:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return local ? JSON.parse(local) : DEFAULT_LEADERBOARD;
  },

  // Redeem Giftcode
  async redeemCode(code, profile) {
    const trimmed = code.trim().toUpperCase();
    const redeemed = JSON.parse(localStorage.getItem(STORAGE_KEYS.REDEEMED_CODES) || '[]');
    
    if (redeemed.includes(trimmed)) {
      return { success: false, message: 'Bạn đã nhận mã quà tặng này rồi!' };
    }

    const validCodes = {
      'XUCXACMAYMAN': 50000,
      'TANTHU': 100000,
      'FREEXU': 25000,
      'LUCKYDICE': 88888,
    };

    if (!validCodes[trimmed]) {
      return { success: false, message: 'Mã giftcode không hợp lệ hoặc đã hết hạn!' };
    }

    const reward = validCodes[trimmed];
    const newBalance = (profile.balance || 0) + reward;
    const updatedProfile = await this.updateBalance(profile, newBalance, false);

    redeemed.push(trimmed);
    localStorage.setItem(STORAGE_KEYS.REDEEMED_CODES, JSON.stringify(redeemed));

    return { 
      success: true, 
      reward, 
      updatedProfile,
      message: `Nhận thành công ${reward.toLocaleString('vi-VN')} Xu!` 
    };
  },

  // Daily Bonus
  checkDailyBonus() {
    const lastClaim = localStorage.getItem(STORAGE_KEYS.LAST_DAILY);
    if (!lastClaim) return true;
    const lastDate = new Date(lastClaim).toDateString();
    const today = new Date().toDateString();
    return lastDate !== today;
  },

  claimDailyBonus(profile) {
    const reward = 20000;
    const newBalance = (profile.balance || 0) + reward;
    localStorage.setItem(STORAGE_KEYS.LAST_DAILY, new Date().toISOString());
    return this.updateBalance(profile, newBalance, false);
  }
};
