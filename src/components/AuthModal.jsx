import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  BadgeDollarSign,
} from 'lucide-react';
import { DBService } from '../services/supabase';
import { sounds } from '../services/audio';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"
      />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [identifier, setIdentifier] = useState(''); // Email (hoặc tên tài khoản)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const switchMode = (nextMode) => {
    sounds.playClick();
    setMode(nextMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSocialLogin = async (provider) => {
    sounds.playClick();
    setError('');
    setSuccessMsg('');
    setOauthLoading(provider);
    const res = await DBService.loginWithOAuth(provider);
    if (!res?.success) {
      setOauthLoading('');
      setError(res?.message || `Không thể đăng nhập bằng ${provider}!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');

    if (mode === 'forgot') {
      if (!isEmail) {
        setError('Vui lòng nhập đúng địa chỉ Email để khôi phục mật khẩu!');
        return;
      }
      setLoading(true);
      const res = await DBService.resetPassword(cleanId);
      setLoading(false);
      if (!res?.success) {
        setError(res?.message);
      } else {
        sounds.playWin();
        setSuccessMsg(res.message);
      }
      return;
    }

    if (cleanId.length < 3) {
      setError('Vui lòng nhập Email hoặc tên tài khoản (ít nhất 3 ký tự)!');
      return;
    }
    if (password.length < 6 && isEmail) {
      setError('Mật khẩu Email phải có ít nhất 6 ký tự!');
      return;
    }
    if (password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    let res;
    if (isEmail) {
      res =
        mode === 'register'
          ? await DBService.registerWithEmail(cleanId, password)
          : await DBService.loginWithEmail(cleanId, password);
    } else {
      if (/\s/.test(cleanId) || cleanId.length > 20) {
        setLoading(false);
        setError('Tên tài khoản từ 3–20 ký tự, không chứa khoảng trắng!');
        return;
      }
      res =
        mode === 'register'
          ? await DBService.register(cleanId, password)
          : await DBService.login(cleanId, password);
    }
    setLoading(false);

    if (!res?.success) {
      sounds.playClick();
      setError(res?.message || 'Thao tác thất bại, vui lòng thử lại!');
      return;
    }

    sounds.playWin();
    setSuccessMsg(res.message);
    if (res.user) {
      onAuthSuccess(res.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2b0b0b] via-[#170908] to-[#0e0706] border border-[#b8923a]/60 rounded-3xl overflow-hidden shadow-2xl shadow-black">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 z-10 p-2 text-stone-300 hover:text-white rounded-full bg-black/50 hover:bg-black/80 border border-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-[#3f1111] via-[#280b0b] to-[#1a0808] px-6 py-4 border-b border-[#b8923a]/30 text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-[#b58420] via-[#e5be53] to-[#fce08b] p-0.5 shadow-xl shadow-amber-900/40">
            <div className="w-full h-full bg-[#120807] rounded-[14px] flex items-center justify-center text-2xl">
              🎲
            </div>
          </div>
          <h2 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fce08b] via-[#f5d061] to-[#c89428] flex items-center justify-center gap-1.5">
            <span>ROYAL CASINO CLUB</span>
            <Sparkles className="w-4 h-4 text-[#f5d061]" />
          </h2>
          <p className="text-[11px] text-stone-300 mt-0.5">
            {mode === 'forgot'
              ? 'Nhập Email để nhận liên kết đặt lại mật khẩu'
              : 'Đăng nhập để lưu số dư & cược thời gian thực'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Khối 1: Social Login (ẩn khi ở màn hình Quên mật khẩu) */}
          {mode !== 'forgot' && (
            <>
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!!oauthLoading || loading}
                  onClick={() => handleSocialLogin('google')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm flex items-center justify-center gap-2.5 border border-stone-200 shadow-sm transition active:scale-[0.99] disabled:opacity-60"
                >
                  <GoogleIcon />
                  <span>
                    {oauthLoading === 'google' ? 'Đang chuyển hướng Google...' : 'Tiếp tục với Google'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!!oauthLoading || loading}
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-[#1877F2]/50 shadow-sm transition active:scale-[0.99] disabled:opacity-60"
                >
                  <FacebookIcon />
                  <span>
                    {oauthLoading === 'facebook'
                      ? 'Đang chuyển hướng Facebook...'
                      : 'Tiếp tục với Facebook'}
                  </span>
                </button>
              </div>

              {/* Khối 2: Đường phân cách "hoặc" */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-white/15" />
                <span className="mx-3 text-xs font-medium text-stone-400 lowercase">hoặc</span>
                <div className="flex-grow border-t border-white/15" />
              </div>
            </>
          )}

          {/* Khối 3: Form Email / Tài khoản & Mật khẩu */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#f5d061] hover:underline mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại đăng nhập</span>
              </button>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                {mode === 'forgot' ? 'Email' : 'Email hoặc Tên tài khoản'}
              </label>
              <input
                type={mode === 'forgot' ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === 'forgot' ? 'you@example.com' : 'you@example.com hoặc tên tài khoản'}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#e5be53] transition"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300">Mật khẩu</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-stone-400 hover:text-[#f5d061] transition"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#e5be53] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#e5be53] transition"
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                <BadgeDollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tặng ngay 100,000đ vào ví khi tạo tài khoản mới!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full py-3 rounded-xl font-black text-sm text-stone-950 royal-gold-btn border border-[#fce08b]/60 transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading
                ? 'Đang xử lý...'
                : mode === 'forgot'
                ? 'Gửi liên kết khôi phục'
                : mode === 'register'
                ? 'Tạo tài khoản'
                : 'Đăng nhập'}
            </button>
          </form>

          {mode !== 'forgot' && (
            <p className="text-center text-xs text-stone-400 pt-1">
              {mode === 'login' ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-bold text-[#f5d061] underline underline-offset-2 hover:text-[#fce08b]"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-[#f5d061] underline underline-offset-2 hover:text-[#fce08b]"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
