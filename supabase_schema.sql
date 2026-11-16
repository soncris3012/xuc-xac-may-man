-- SQL Schema for "Xúc Xắc May Mắn" (Lucky Dice)
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Bảng Profiles (Người chơi)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    balance BIGINT NOT NULL DEFAULT 100000,
    total_played INT NOT NULL DEFAULT 0,
    total_won INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng Lịch sử phiên xúc xắc (Game History)
CREATE TABLE IF NOT EXISTS public.game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    dice_1 INT NOT NULL,
    dice_2 INT NOT NULL,
    dice_3 INT NOT NULL,
    total_score INT NOT NULL,
    outcome_result TEXT NOT NULL, -- 'TÀI' hoặc 'XỈU'
    outcome_parity TEXT NOT NULL, -- 'CHẴN' hoặc 'LẺ'
    bet_type TEXT NOT NULL,       -- 'TAI', 'XIU', 'CHAN', 'LE', 'BAO', etc.
    bet_amount BIGINT NOT NULL,
    is_win BOOLEAN NOT NULL,
    payout BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng Giftcode (Mã quà tặng xu vui vẻ)
CREATE TABLE IF NOT EXISTS public.giftcodes (
    code TEXT PRIMARY KEY,
    reward BIGINT NOT NULL,
    max_uses INT DEFAULT 9999,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Thêm một số giftcode mẫu
INSERT INTO public.giftcodes (code, reward) VALUES
('XUCXACMAYMAN', 50000),
('TANTHU', 100000),
('FREEXU', 20000)
ON CONFLICT (code) DO NOTHING;

-- 4. Bật Row Level Security (RLS) và tạo Policy cho phép đọc/ghi công khai (Public demo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giftcodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả đọc profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm và sửa profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Cho phép tất cả đọc game_history" ON public.game_history FOR SELECT USING (true);
CREATE POLICY "Cho phép thêm game_history" ON public.game_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Cho phép đọc giftcodes" ON public.giftcodes FOR SELECT USING (true);
