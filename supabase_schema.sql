-- =====================================================================
-- SQL Schema for "Xúc Xắc May Mắn" (Realtime Casino + Auth + Supabase)
-- Project: bnvnjuqsekqwqmoiqvcl
-- =====================================================================

-- 1. Bảng người chơi công khai
CREATE TABLE IF NOT EXISTS public.xucxac_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    balance BIGINT NOT NULL DEFAULT 100000 CHECK (balance >= 0),
    vip_level INT NOT NULL DEFAULT 1 CHECK (vip_level BETWEEN 1 AND 10),
    total_played INT NOT NULL DEFAULT 0,
    total_won INT NOT NULL DEFAULT 0,
    last_daily_claim DATE,
    is_online BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_xucxac_users_username_lower
    ON public.xucxac_users (lower(username));
CREATE INDEX IF NOT EXISTS idx_xucxac_users_balance_desc
    ON public.xucxac_users (balance DESC);

-- 2. Bảng lưu mật khẩu mã hóa tách biệt (chỉ truy cập qua RPC SECURITY DEFINER)
CREATE TABLE IF NOT EXISTS public.xucxac_auth_secrets (
    user_id UUID PRIMARY KEY REFERENCES public.xucxac_users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Bảng lịch sử các phiên xúc xắc
CREATE TABLE IF NOT EXISTS public.xucxac_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.xucxac_users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    dice_1 INT NOT NULL CHECK (dice_1 BETWEEN 1 AND 6),
    dice_2 INT NOT NULL CHECK (dice_2 BETWEEN 1 AND 6),
    dice_3 INT NOT NULL CHECK (dice_3 BETWEEN 1 AND 6),
    total_score INT NOT NULL CHECK (total_score BETWEEN 3 AND 18),
    outcome_result TEXT NOT NULL CHECK (outcome_result IN ('TÀI', 'XỈU')),
    outcome_parity TEXT NOT NULL CHECK (outcome_parity IN ('CHẴN', 'LẺ')),
    is_bao BOOLEAN NOT NULL DEFAULT false,
    bet_type TEXT NOT NULL DEFAULT 'NONE',
    bet_amount BIGINT NOT NULL DEFAULT 0,
    is_win BOOLEAN NOT NULL DEFAULT false,
    payout BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_xucxac_rounds_created_at_desc
    ON public.xucxac_rounds (created_at DESC);

-- 4. Bảng lệnh đặt cược trực tiếp trên bàn theo thời gian thực
CREATE TABLE IF NOT EXISTS public.xucxac_bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.xucxac_users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    vip_level INT NOT NULL DEFAULT 1,
    bet_zone TEXT NOT NULL,
    bet_amount BIGINT NOT NULL CHECK (bet_amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
    payout BIGINT NOT NULL DEFAULT 0,
    round_id UUID REFERENCES public.xucxac_rounds(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_xucxac_bets_created_at_desc
    ON public.xucxac_bets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xucxac_bets_user_status
    ON public.xucxac_bets (user_id, status);

-- 5. Bảng Giftcode & lịch sử nhận Giftcode
CREATE TABLE IF NOT EXISTS public.xucxac_giftcodes (
    code TEXT PRIMARY KEY,
    reward BIGINT NOT NULL CHECK (reward > 0),
    max_uses INT NOT NULL DEFAULT 9999,
    times_used INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.xucxac_giftcode_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.xucxac_users(id) ON DELETE CASCADE,
    code TEXT NOT NULL REFERENCES public.xucxac_giftcodes(code) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, code)
);

-- 6. Bật RLS & cấp quyền
ALTER TABLE public.xucxac_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xucxac_auth_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xucxac_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xucxac_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xucxac_giftcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xucxac_giftcode_claims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.xucxac_auth_secrets FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.xucxac_users TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.xucxac_rounds TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.xucxac_bets TO anon, authenticated;
GRANT SELECT ON TABLE public.xucxac_giftcodes TO anon, authenticated;
GRANT SELECT ON TABLE public.xucxac_giftcode_claims TO anon, authenticated;

CREATE POLICY "xucxac_users_select_all" ON public.xucxac_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "xucxac_users_update_all" ON public.xucxac_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "xucxac_rounds_select_all" ON public.xucxac_rounds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "xucxac_rounds_insert_all" ON public.xucxac_rounds FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "xucxac_bets_select_all" ON public.xucxac_bets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "xucxac_bets_insert_all" ON public.xucxac_bets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "xucxac_bets_update_all" ON public.xucxac_bets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "xucxac_bets_delete_all" ON public.xucxac_bets FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "xucxac_giftcodes_select_all" ON public.xucxac_giftcodes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "xucxac_giftcode_claims_select_all" ON public.xucxac_giftcode_claims FOR SELECT TO anon, authenticated USING (true);

-- 7. Các hàm RPC cho Đăng ký, Đăng nhập, Giftcode, Điểm danh
CREATE OR REPLACE FUNCTION public.xucxac_register(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_username TEXT := trim(p_username);
    v_user public.xucxac_users%ROWTYPE;
BEGIN
    IF v_username IS NULL OR char_length(v_username) < 3 OR char_length(v_username) > 20 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tên tài khoản phải từ 3 đến 20 ký tự!');
    END IF;

    IF v_username ~ '\s' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tên tài khoản không được chứa khoảng trắng!');
    END IF;

    IF p_password IS NULL OR char_length(p_password) < 4 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mật khẩu phải có ít nhất 4 ký tự!');
    END IF;

    IF EXISTS (SELECT 1 FROM public.xucxac_users WHERE lower(username) = lower(v_username)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tên tài khoản đã tồn tại, vui lòng chọn tên khác!');
    END IF;

    INSERT INTO public.xucxac_users (username, balance, vip_level, is_online, last_seen_at)
    VALUES (v_username, 100000, 1, true, timezone('utc'::text, now()))
    RETURNING * INTO v_user;

    INSERT INTO public.xucxac_auth_secrets (user_id, password_hash)
    VALUES (v_user.id, extensions.crypt(p_password, extensions.gen_salt('bf')));

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đăng ký thành công! Tặng bạn $100,000 vốn khởi nghiệp.',
        'user', to_jsonb(v_user)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.xucxac_login(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_username TEXT := trim(p_username);
    v_user public.xucxac_users%ROWTYPE;
    v_hash TEXT;
BEGIN
    IF v_username IS NULL OR p_password IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!');
    END IF;

    SELECT u.* INTO v_user
    FROM public.xucxac_users u
    WHERE lower(u.username) = lower(v_username)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tài khoản không tồn tại!');
    END IF;

    SELECT s.password_hash INTO v_hash
    FROM public.xucxac_auth_secrets s
    WHERE s.user_id = v_user.id;

    IF v_hash IS NULL OR extensions.crypt(p_password, v_hash) <> v_hash THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mật khẩu không chính xác!');
    END IF;

    UPDATE public.xucxac_users
    SET is_online = true,
        last_seen_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user.id
    RETURNING * INTO v_user;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đăng nhập thành công!',
        'user', to_jsonb(v_user)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.xucxac_redeem_giftcode(p_user_id UUID, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_code TEXT := upper(trim(p_code));
    v_gift public.xucxac_giftcodes%ROWTYPE;
    v_user public.xucxac_users%ROWTYPE;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập để nhận Giftcode!');
    END IF;

    SELECT * INTO v_gift
    FROM public.xucxac_giftcodes
    WHERE code = v_code AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mã giftcode không hợp lệ hoặc đã hết hạn!');
    END IF;

    IF v_gift.times_used >= v_gift.max_uses THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mã giftcode đã hết lượt sử dụng!');
    END IF;

    IF EXISTS (SELECT 1 FROM public.xucxac_giftcode_claims WHERE user_id = p_user_id AND code = v_code) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn đã nhận mã quà tặng này rồi!');
    END IF;

    INSERT INTO public.xucxac_giftcode_claims (user_id, code)
    VALUES (p_user_id, v_code);

    UPDATE public.xucxac_giftcodes
    SET times_used = times_used + 1
    WHERE code = v_code;

    UPDATE public.xucxac_users
    SET balance = balance + v_gift.reward,
        vip_level = LEAST(10, GREATEST(1, FLOOR((balance + v_gift.reward) / 200000)::INT + 1)),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id
    RETURNING * INTO v_user;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy tài khoản người chơi!');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'reward', v_gift.reward,
        'message', format('Nhận thành công $%s từ mã %s!', to_char(v_gift.reward, 'FM999,999,999'), v_code),
        'user', to_jsonb(v_user)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.xucxac_claim_daily(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user public.xucxac_users%ROWTYPE;
    v_today DATE := (timezone('Asia/Ho_Chi_Minh', now()))::DATE;
    v_reward BIGINT := 20000;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Vui lòng đăng nhập để điểm danh!');
    END IF;

    SELECT * INTO v_user FROM public.xucxac_users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy người chơi!');
    END IF;

    IF v_user.last_daily_claim IS NOT NULL AND v_user.last_daily_claim >= v_today THEN
        RETURN jsonb_build_object('success', false, 'message', 'Hôm nay bạn đã điểm danh nhận thưởng rồi!');
    END IF;

    UPDATE public.xucxac_users
    SET balance = balance + v_reward,
        vip_level = LEAST(10, GREATEST(1, FLOOR((balance + v_reward) / 200000)::INT + 1)),
        last_daily_claim = v_today,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id
    RETURNING * INTO v_user;

    RETURN jsonb_build_object(
        'success', true,
        'reward', v_reward,
        'message', 'Điểm danh thành công! Bạn nhận được +$20,000!',
        'user', to_jsonb(v_user)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.xucxac_register(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xucxac_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xucxac_redeem_giftcode(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xucxac_claim_daily(UUID) TO anon, authenticated;

-- 8. Bật Realtime
ALTER TABLE public.xucxac_users REPLICA IDENTITY FULL;
ALTER TABLE public.xucxac_rounds REPLICA IDENTITY FULL;
ALTER TABLE public.xucxac_bets REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'xucxac_users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.xucxac_users;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'xucxac_rounds'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.xucxac_rounds;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'xucxac_bets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.xucxac_bets;
    END IF;
END $$;

-- 9. Seed Giftcodes
INSERT INTO public.xucxac_giftcodes (code, reward, max_uses) VALUES
    ('XUCXACMAYMAN', 50000, 9999),
    ('TANTHU', 100000, 9999),
    ('FREEXU', 25000, 9999),
    ('LUCKYDICE', 88888, 9999),
    ('VIPCASINO', 150000, 9999)
ON CONFLICT (code) DO NOTHING;
